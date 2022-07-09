/* eslint-disable @typescript-eslint/no-loop-func */
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
import { minOfArray, retryPromise } from '../misc';
import { SpotifyAPI } from '../spotifyApi';
import { Unpack } from '../types';
import { getFromCacheString, setToCacheString } from './cache';
import {
  FullPrivacyImporterState,
  HistoryImporter,
  ImporterStateTypes,
} from './types';

const fullPrivacyFileSchema = z.array(
  z.object({
    ts: z.string(),
    username: z.string(),
    platform: z.string(),
    ms_played: z.number(),
    conn_country: z.string(),
    ip_addr_decrypted: z.string(),
    user_agent_decrypted: z.nullable(z.string()),
    master_metadata_track_name: z.nullable(z.string()),
    master_metadata_album_artist_name: z.nullable(z.string()),
    master_metadata_album_album_name: z.nullable(z.string()),
    spotify_track_uri: z.nullable(z.string()),
    episode_name: z.nullable(z.string()),
    episode_show_name: z.nullable(z.string()),
    spotify_episode_uri: z.nullable(z.string()),
    reason_start: z.string(),
    reason_end: z.string(),
    shuffle: z.boolean(),
    skipped: z.nullable(z.boolean()),
    offline: z.nullable(z.boolean()),
    offline_timestamp: z.nullable(z.number()),
    incognito_mode: z.nullable(z.boolean()),
  }),
);

export type FullPrivacyItem = Unpack<z.infer<typeof fullPrivacyFileSchema>>;

export class FullPrivacyImporter
  implements HistoryImporter<ImporterStateTypes.fullPrivacy>
{
  private id: string;

  private userId: string;

  private elements: FullPrivacyItem[] | null;

  private currentItem: number;

  private spotifyApi: SpotifyAPI;

  constructor(user: User) {
    this.id = '';
    this.userId = user._id.toString();
    this.elements = null;
    this.currentItem = 0;
    this.spotifyApi = new SpotifyAPI(this.userId);
  }

  static idFromSpotifyURI = (uri: string) => uri.split(':')[2];

  search = async (spotifyIds: string[]) => {
    const res = await retryPromise(
      () => this.spotifyApi.getTracksFromIds(spotifyIds),
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
      const date = new Date(item.played_at);
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
      const validations = fullPrivacyFileSchema.parse(content);
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

    const totalContent = filesContent.reduce<FullPrivacyItem[]>((acc, curr) => {
      acc.push(...curr);
      return acc;
    }, []);

    if (!this.initWithJSONContent(totalContent)) {
      return false;
    }

    return true;
  };

  init = async (
    existingState: FullPrivacyImporterState | null,
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

  checkIdsToSearch = async (
    idsToSearch: Record<string, string[]>,
    items: RecentlyPlayedTrack[],
    force = false,
  ) => {
    const ids = Object.keys(idsToSearch);
    if (ids.length < 45 && !force) {
      return idsToSearch;
    }
    const searchedItems = await this.search(ids);
    searchedItems.forEach(searchedItem => {
      const playedAt = idsToSearch[searchedItem.id];
      if (!playedAt) {
        logger.error('Cannot add item', searchedItem.id, 'no played_at found');
        return;
      }
      setToCacheString(this.userId.toString(), searchedItem.id, searchedItem);
      playedAt.forEach(pa => {
        items.push({ track: searchedItem, played_at: pa });
      });
      logger.info(
        `Adding ${searchedItem.name} - ${searchedItem.artists[0].name} from data`,
      );
    });
    idsToSearch = {};
    return idsToSearch;
  };

  run = async (id: string) => {
    this.id = id;
    let items: RecentlyPlayedTrack[] = [];
    // Id of song to played_at
    let idsToSearch: Record<string, string[]> = {};
    if (!this.elements) {
      return false;
    }
    for (let i = this.currentItem; i < this.elements.length; i += 1) {
      this.currentItem = i;
      logger.info(`Importing... (${i}/${this.elements.length})`);
      const content = this.elements[i];
      if (
        !content.spotify_track_uri ||
        !content.master_metadata_track_name ||
        !content.master_metadata_album_artist_name
      ) {
        continue;
      }
      if (content.ms_played < 30 * 1000) {
        // If track was played for less than 30 seconds
        logger.info(
          `Track ${content.master_metadata_track_name} - ${
            content.master_metadata_album_artist_name
          } was passed, only listened for ${Math.floor(
            content.ms_played / 1000,
          )} seconds`,
        );
        continue;
      }
      const spotifyId = FullPrivacyImporter.idFromSpotifyURI(
        content.spotify_track_uri,
      );
      const item = getFromCacheString(this.userId.toString(), spotifyId);
      if (!item) {
        const arrayOfPlayedAt = idsToSearch[spotifyId] ?? [];
        arrayOfPlayedAt.push(content.ts);
        idsToSearch[spotifyId] = arrayOfPlayedAt;
        idsToSearch = await this.checkIdsToSearch(idsToSearch, items);
      } else {
        items.push({ track: item, played_at: content.ts });
      }
      if (items.length >= 20) {
        await this.storeItems(this.userId, items);
        items = [];
      }
    }
    await this.checkIdsToSearch(idsToSearch, items, true);
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
