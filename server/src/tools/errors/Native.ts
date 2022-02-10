export class YSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotImplemented extends YSError {
  constructor() {
    super('Not implemented');
  }
}
