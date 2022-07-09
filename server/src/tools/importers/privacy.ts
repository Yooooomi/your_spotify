/* eslint-disable no-await-in-loop */
import { readFile, unlink } from 'fs/promises';
import { z } from 'zod';
import {
  addTrackIdsToUser,
  getCloseTrackId,
  storeFirstListenedAtIfLess,
} from '../../database';
import { setImporterStateCurrent } from '../../database/queries/importer';
import { RecentlyPlayedTrack } from '../../database/schemas/track';
import { User } from '../../database/schemas/user';
import { saveMusics } from '../../spotify/dbTools';
import { logger } from '../logger';
import {
  beforeParenthesis,
  minOfArray,
  removeDiacritics,
  retryPromise,
} from '../misc';
import { SpotifyAPI } from '../spotifyApi';
import { Unpack } from '../types';
import { getFromCache, setToCache } from './cache';
import {
  HistoryImporter,
  ImporterStateTypes,
  PrivacyImporterState,
} from './types';

const privacyFileSchema = z.array(
  z.object({
    endTime: z.string(),
    artistName: z.string(),
    trackName: z.string(),
    msPlayed: z.number(),
  }),
);

export type PrivacyItem = Unpack<z.infer<typeof privacyFileSchema>>;

export class PrivacyImporter
  implements HistoryImporter<ImporterStateTypes.privacy>
{
  private id: string;

  private userId: string;

  private elements: PrivacyItem[] | null;

  private currentItem: number;

  private spotifyApi: SpotifyAPI;

  constructor(user: User) {
    this.id = '';
    this.userId = user._id.toString();
    this.elements = null;
    this.currentItem = 0;
    this.spotifyApi = new SpotifyAPI(this.userId);
  }

  search = async (track: string, artist: string) => {
    const res = await retryPromise(
      () => this.spotifyApi.search(track, artist),
      10,
      30,
    );
    return res;
  };

  storeItems = async (userId: string, items: RecentlyPlayedTrack[]) => {
    await saveMusics(
      userId,
      items.map(it => it.track),
    );
    const finalInfos: { played_at: Date; id: string }[] = [];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const date = new Date(`${item.played_at}Z`);
      const duplicate = await getCloseTrackId(
        this.userId.toString(),
        item.track.id,
        date,
        60,
      );
      if (duplicate.length > 0) {
        logger.info(
          `${item.track.name} - ${item.track.artists[0].name} was duplicate`,
        );
        continue;
      }
      finalInfos.push({
        played_at: date,
        id: item.track.id,
      });
    }
    await setImporterStateCurrent(this.id, this.currentItem + 1);
    await addTrackIdsToUser(this.userId.toString(), finalInfos);
    const min = minOfArray(finalInfos, info => info.played_at.getTime());
    if (min) {
      await storeFirstListenedAtIfLess(
        this.userId,
        finalInfos[min.minIndex].played_at,
      );
    }
  };

  initWithJSONContent = async (content: any[]) => {
    try {
      const validations = privacyFileSchema.parse(content);
      this.elements = validations;
      return content;
    } catch (e) {
      logger.error(e);
    }
    return null;
  };

  initWithFiles = async (filePaths: string[]) => {
    const files = await Promise.all(filePaths.map(f => readFile(f)));
    const filesContent = files.map(f => JSON.parse(f.toString()));

    const totalContent = filesContent.reduce<PrivacyItem[]>((acc, curr) => {
      acc.push(...curr);
      return acc;
    }, []);

    if (!this.initWithJSONContent(totalContent)) {
      return false;
    }

    return true;
  };

  init = async (
    existingState: PrivacyImporterState | null,
    filePaths: string[],
  ) => {
    try {
      this.currentItem = existingState?.current ?? 0;
      const success = await this.initWithFiles(filePaths);
      if (success) {
        return { total: this.elements!.length };
      }
    } catch (e) {
      logger.error(e);
    }
    return null;
  };

  run = async (id: string) => {
    this.id = id;
    let items: RecentlyPlayedTrack[] = [];
    if (!this.elements) {
      return false;
    }
    for (let i = this.currentItem; i < this.elements.length; i += 1) {
      this.currentItem = i;
      const content = this.elements[i];
      if (content.msPlayed < 30 * 1000) {
        // If track was played for less than 30 seconds
        logger.info(
          `Track ${content.trackName} - ${
            content.artistName
          } was passed, only listened for ${Math.floor(
            content.msPlayed / 1000,
          )} seconds`,
        );
        continue;
      }
      let item = getFromCache(
        this.userId.toString(),
        content.trackName,
        content.artistName,
      );
      if (!item) {
        item = await this.search(
          removeDiacritics(content.trackName),
          removeDiacritics(content.artistName),
        );
      }
      if (!item) {
        item = await this.search(
          removeDiacritics(beforeParenthesis(content.trackName)),
          removeDiacritics(beforeParenthesis(content.artistName)),
        );
      }
      if (!item) {
        logger.warn(
          `${content.trackName} by ${content.artistName} was not found by search`,
        );
        continue;
      }
      setToCache(
        this.userId.toString(),
        content.trackName,
        content.artistName,
        item,
      );
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

  // eslint-disable-next-line class-methods-use-this
  cleanup = async (filePaths: string[]) => {
    await Promise.all(filePaths.map(f => unlink(f)));
  };
}
