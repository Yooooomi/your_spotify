const { YSError } = require('./Native');

class DatabaseError extends YSError {
  constructor(msg) {
    super(msg);
  }
}

class NoResult extends DatabaseError {
  constructor() {
    super('No result found');
  }
}

module.exports = {
  NoResult,
};
