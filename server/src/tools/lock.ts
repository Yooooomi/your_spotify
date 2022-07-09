import { logger } from './logger';

interface PromiseStore {
  res: () => void;
}

class Lock {
  private name: string;

  private locked: boolean;

  private lockQueue: PromiseStore[];

  constructor(name: string) {
    this.name = name;
    this.locked = false;
    this.lockQueue = [];
  }

  check = () => {
    if (this.locked || this.lockQueue.length === 0) {
      return;
    }
    const nextOne = this.lockQueue.shift();
    if (!nextOne) {
      return;
    }
    logger.debug(`Locking ${this.name}`);
    this.locked = true;
    nextOne.res();
    this.check();
  };

  lock = () =>
    new Promise<void>(res => {
      this.lockQueue.push({ res });
      this.check();
    });

  unlock = () => {
    this.locked = false;
    logger.debug(`Unlocking ${this.name}`);
    this.check();
  };
}

export const longWriteDbLock = new Lock('DB_LongWriteLock');
