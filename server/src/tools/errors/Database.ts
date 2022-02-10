class DatabaseError extends Error {}

export class NoResult extends DatabaseError {
  constructor() {
    super('No result found');
  }
}
