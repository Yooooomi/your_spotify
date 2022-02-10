import { Schema } from 'mongoose';

export interface Migration {
  lastRun: string;
  migrations: any[];
}

export const MigrationSchema = new Schema<Migration>({
  lastRun: String, // Name of the last file ran
  migrations: Array,
});
