/* eslint-disable no-await-in-loop */
import { wait } from './misc';

interface QueueItem<T> {
  fn: () => Promise<T>;
  onResolve: (data: T) => void;
  onError: (error: Error) => void;
}

export class PromiseQueue<T> {
  private q: QueueItem<T>[] = [];

  execQueue = async () => {
    while (this.q.length > 0) {
      const item = this.q[0];
      if (!item) {
        continue;
      }
      try {
        const data = await item.fn();
        item.onResolve(data);
      } catch (e) {
        item.onError(e);
      }
      await wait(1000);
      this.q.shift();
    }
  };

  queue = (fn: () => Promise<T>) => {
    return new Promise<T>((res, rej) => {
      this.q.push({
        fn,
        onResolve: res,
        onError: rej,
      });
      if (this.q.length === 1) {
        this.execQueue();
      }
    });
  };
}
