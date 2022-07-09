import { Types } from 'mongoose';

export interface HistoryImporter<T extends ImporterState['type']> {
  init: (
    existingState: ImporterStateFromType<T> | null,
    requiredData: ImporterStateFromType<T>['metadata'],
  ) => Promise<{ total: number } | null>;
  run: (id: string) => Promise<boolean>;
  cleanup: (
    requiredData: ImporterStateFromType<T>['metadata'],
  ) => Promise<void>;
}

export type ImporterStateStatus =
  | 'progress'
  | 'success'
  | 'failure'
  | 'failure-removed';

export interface BaseImporterState {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: string;
  current: number;
  total: number;
  status: ImporterStateStatus;
}

export enum ImporterStateTypes {
  privacy = 'privacy',
  fullPrivacy = 'full-privacy',
}
export const importerStateTypes = Object.values(ImporterStateTypes);

export interface PrivacyImporterState extends BaseImporterState {
  type: ImporterStateTypes.privacy;
  metadata: string[];
}

export interface FullPrivacyImporterState extends BaseImporterState {
  type: ImporterStateTypes.fullPrivacy;
  metadata: string[];
}

export type ImporterState = PrivacyImporterState | FullPrivacyImporterState;
export type ImporterStateFromType<T extends ImporterStateTypes> = Extract<
  ImporterState,
  { type: T }
>;
