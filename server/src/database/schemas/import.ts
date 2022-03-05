import { Schema } from 'mongoose';
import { ImporterState } from '../../tools/importers/types';

export const ImporterStateSchema = new Schema<ImporterState>(
  {
    type: { type: String, required: true },
    total: { type: Number, required: true },
    current: { type: Number, default: 0 },
    metadata: {},
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['progress', 'success', 'failure', 'failure-removed'],
      default: 'progress',
    },
  },
  { timestamps: true },
);
