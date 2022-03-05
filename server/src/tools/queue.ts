/* eslint-disable no-await-in-loop */

import { AxiosInstance } from 'axios';
import { Types } from 'mongoose';
import { getUserFromField, storeInUser } from '../database';
import { logger } from './logger';
import { wait } from './misc';
import { Spotify } from './oauth/Provider';

interface QueueItem<T, Meta, MetaResult> {
  meta: Meta;
  fn: (metaResult: MetaResult) => Promise<T>;
  onResolve: (data: T) => void;
  onError: (error: Error) => void;
}

class PromiseQueue<T, Meta, MetaResult> {
  private q: QueueItem<T, Meta, MetaResult>[] = [];

  private onMetadataNull: string;

  private before: (meta: Meta) => Promise<MetaResult | null>;

  constructor(before: (meta: Meta) => Promise<MetaResult | null>, onMetadataNull: string) {
    this.q = [];
    this.before = before;
    this.onMetadataNull = onMetadataNull;
  }

  execQueue = async () => {
    while (this.q.length > 0) {
      const item = this.q[0];
      if (!item) {
        continue;
      }
      try {
        const res = await this.before(item.meta);
        if (res) {
          const data = await item.fn(res);
          item.onResolve(data);
        } else {
          item.onError(new Error(this.onMetadataNull));
        }
      } catch (e) {
        item.onError(e);
      }
      await wait(1000);
      this.q.shift();
    }
  };

  queue = (fn: (metaResult: MetaResult) => Promise<T>, meta: Meta) => {
    return new Promise<T>((res, rej) => {
      this.q.push({
        fn,
        meta,
        onResolve: res,
        onError: rej,
      });
      if (this.q.length === 1) {
        this.execQueue();
      }
    });
  };
}

export const squeue = new PromiseQueue<any, string, AxiosInstance>(async (userId: string) => {
  // Refresh the token if it expires in less than two minutes (1000ms * 120)
  const user = await getUserFromField('_id', new Types.ObjectId(userId));
  let access: string | null | undefined = user?.accessToken;
  if (!user) {
    return null;
  }
  if (Date.now() > user.expiresIn - 1000 * 120) {
    const token = user.refreshToken;
    if (!token) {
      return null;
    }
    const infos = await Spotify.refresh(token);

    await storeInUser('_id', user._id, infos);
    logger.info(`Refreshed token for ${user.username}`);
    access = infos.accessToken;
  }
  if (access) {
    return Spotify.getHttpClient(access);
  }
  return null;
}, 'Could not get access token of user');
