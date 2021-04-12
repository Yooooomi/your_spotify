class DatabaseError extends Error {
}

class NoResult extends DatabaseError {
  constructor() {
    super('No result found');
  }
}

module.exports = {
  NoResult,
};
