/* eslint-disable no-await-in-loop */
import { AxiosInstance } from 'axios';
import { readFile } from 'fs/promises';
import Joi from 'joi';
import { addTrackIdsToUser, getCloseTrackId } from '../../database';
import { RecentlyPlayedTrack, SpotifyTrack } from '../../database/schemas/track';
import { User } from '../../database/schemas/user';
import { refreshIfNeeded, saveMusics } from '../../spotify/dbTools';
import { logger } from '../logger';
import { beforeParenthesis, removeDiacritics } from '../misc';
import { Spotify } from '../oauth/Provider';
import { squeue } from '../queue';
import { getFromCache, setToCache } from './cache';
import { HistoryImporter, PrivacyItem } from './types';

const privacyFileSchema = Joi.array().items(
  Joi.object({
    endTime: Joi.string().required(),
    artistName: Joi.string().required(),
    trackName: Joi.string().required(),
    msPlayed: Joi.number().required(),
  }),
);

export class PrivacyImporter implements HistoryImporter {
  private user: User;

  private elements: PrivacyItem[] | null;

  private currentItem: number;

  private _client: AxiosInstance | null;

  constructor(user: User) {
    this.user = user;
    this._client = null;
    this.elements = null;
    this.currentItem = 0;
  }

  getProgress = () => {
    if (!this.elements) {
      return undefined;
    }
    return [this.currentItem, this.elements.length] as [number, number];
  };

  ensureClient = async () => {
    if (this._client) return this._client;
    const newUser = await refreshIfNeeded(this.user);
    if (!newUser) {
      throw new Error(`No refresh token on ${this.user.username}`);
    }
    this.user = newUser;
    if (!this.user.accessToken) {
      throw new Error(`No access token for ${this.user.username}`);
    }
    this._client = Spotify.getHttpClient(this.user.accessToken);
    return this._client;
  };

  static search = async (client: AxiosInstance, track: string, artist: string) => {
    const res = await squeue.queue(() =>
      client.get(
        `/search?q=track:${encodeURIComponent(track)}+artist:${encodeURIComponent(
          artist,
        )}&type=track&limit=10`,
      ),
    );
    return res.data.tracks.items[0] as SpotifyTrack;
  };

  storeItems = async (client: AxiosInstance, items: RecentlyPlayedTrack[]) => {
    await saveMusics(
      items.map((it) => it.track),
      client,
    );
    const finalInfos: { played_at: Date; id: string }[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const date = new Date(`${item.played_at}Z`);
      const startDate = new Date(date.getTime());
      startDate.setMinutes(startDate.getMinutes() - 1);
      const endDate = new Date(date.getTime());
      endDate.setMinutes(endDate.getMinutes() + 1);
      const duplicate = await getCloseTrackId(
        this.user._id.toString(),
        item.track.id,
        startDate,
        endDate,
      );
      if (duplicate.length > 0) {
        logger.info(`${item.track.name} - ${item.track.artists[0].name} was duplicate`);
        continue;
      }
      finalInfos.push({
        played_at: date,
        id: item.track.id,
      });
    }
    await addTrackIdsToUser(this.user._id.toString(), finalInfos);
  };

  initWithFiles = async (filePaths: string[]) => {
    const files = await Promise.all(filePaths.map((f) => readFile(f)));
    const filesContent = files.map((f) => JSON.parse(f.toString()));
    const validations = filesContent.map((f) => privacyFileSchema.validate(f));
    if (validations.some((v) => v.error !== undefined)) {
      return false;
    }
    const totalContent = filesContent.reduce<PrivacyItem[]>((acc, curr) => {
      acc.push(...curr);
      return acc;
    }, []);
    this.elements = totalContent;
    return true;
  };

  init = async (filePaths: string[]) => {
    try {
      const success = await this.initWithFiles(filePaths);
      return success;
    } catch (e) {
      logger.error(e);
    }
    return false;
  };

  run = async () => {
    let items: RecentlyPlayedTrack[] = [];
    if (!this.elements) {
      return false;
    }
    for (let i = 0; i < this.elements.length; i += 1) {
      this.currentItem = i;
      const content = this.elements[i];
      if (content.msPlayed < 30 * 1000) {
        // If track was played for less than 30 seconds
        logger.info(
          `Track ${content.trackName} - ${
            content.artistName
          } was passed, only listened for ${Math.floor(content.msPlayed / 1000)} seconds`,
        );
        continue;
      }
      const client = await this.ensureClient();
      let item = getFromCache(this.user._id.toString(), content.trackName, content.artistName);
      if (!item) {
        item = await PrivacyImporter.search(
          client,
          removeDiacritics(content.trackName),
          removeDiacritics(content.artistName),
        );
      }
      if (!item) {
        item = await PrivacyImporter.search(
          client,
          removeDiacritics(beforeParenthesis(content.trackName)),
          removeDiacritics(beforeParenthesis(content.artistName)),
        );
      }
      if (!item) {
        logger.warn(`${content.trackName} by ${content.artistName} was not found by search`);
        continue;
      }
      setToCache(this.user._id.toString(), content.trackName, content.artistName, item);
      logger.info(`Adding ${item.name} - ${item.artists[0].name} from data`);
      items.push({ track: item, played_at: content.endTime });
      if (items.length >= 20) {
        await this.storeItems(client, items);
        items = [];
      }
    }
    const client = await this.ensureClient();
    if (items.length > 0) {
      await this.storeItems(client, items);
      items = [];
    }
    return true;
  };
}
