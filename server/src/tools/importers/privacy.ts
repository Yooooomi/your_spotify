/* eslint-disable no-await-in-loop */
import { readFile } from 'fs/promises';
import Joi from 'joi';
import { addTrackIdsToUser, getCloseTrackId } from '../../database';
import { RecentlyPlayedTrack, SpotifyTrack } from '../../database/schemas/track';
import { User } from '../../database/schemas/user';
import { saveMusics } from '../../spotify/dbTools';
import { logger } from '../logger';
import { beforeParenthesis, removeDiacritics } from '../misc';
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
  private userId: string;

  private user: User;

  private elements: PrivacyItem[] | null;

  private currentItem: number;

  constructor(user: User) {
    this.userId = user._id.toString();
    this.user = user;
    this.elements = null;
    this.currentItem = 0;
  }

  getProgress = () => {
    if (!this.elements) {
      return undefined;
    }
    return [this.currentItem, this.elements.length] as [number, number];
  };

  static search = async (userId: string, track: string, artist: string) => {
    const res = await squeue.queue(
      (client) =>
        client.get(
          `/search?q=track:${encodeURIComponent(track)}+artist:${encodeURIComponent(
            artist,
          )}&type=track&limit=10`,
        ),
      userId,
    );
    return res.data.tracks.items[0] as SpotifyTrack;
  };

  storeItems = async (userId: string, items: RecentlyPlayedTrack[]) => {
    await saveMusics(
      userId,
      items.map((it) => it.track),
    );
    const finalInfos: { played_at: Date; id: string }[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const date = new Date(`${item.played_at}Z`);
      const duplicate = await getCloseTrackId(this.userId.toString(), item.track.id, date, 60);
      if (duplicate.length > 0) {
        logger.info(`${item.track.name} - ${item.track.artists[0].name} was duplicate`);
        continue;
      }
      finalInfos.push({
        played_at: date,
        id: item.track.id,
      });
    }
    await addTrackIdsToUser(this.userId.toString(), finalInfos);
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
      let item = getFromCache(this.userId.toString(), content.trackName, content.artistName);
      if (!item) {
        item = await PrivacyImporter.search(
          this.userId,
          removeDiacritics(content.trackName),
          removeDiacritics(content.artistName),
        );
      }
      if (!item) {
        item = await PrivacyImporter.search(
          this.userId,
          removeDiacritics(beforeParenthesis(content.trackName)),
          removeDiacritics(beforeParenthesis(content.artistName)),
        );
      }
      if (!item) {
        logger.warn(`${content.trackName} by ${content.artistName} was not found by search`);
        continue;
      }
      setToCache(this.userId.toString(), content.trackName, content.artistName, item);
      logger.info(
        `Adding ${item.name} - ${item.artists[0].name} from data (${i}/${this.elements.length})`,
      );
      items.push({ track: item, played_at: content.endTime });
      if (items.length >= 20) {
        await this.storeItems(this.userId, items);
        items = [];
      }
    }
    if (items.length > 0) {
      await this.storeItems(this.userId, items);
      items = [];
    }
    return true;
  };
}
