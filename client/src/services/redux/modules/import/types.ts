export type ImporterStateStatus =
  | 'progress'
  | 'success'
  | 'failure'
  | 'failure-removed';

export enum ImporterStateTypes {
  privacy = 'privacy',
  fullPrivacy = 'full-privacy',
}

export interface BaseImporterState {
  _id: string;
  createdAt: string;
  user: string;
  type: string;
  current: number;
  total: number;
  status: ImporterStateStatus;
}

export interface PrivacyImporterState extends BaseImporterState {
  type: ImporterStateTypes.privacy;
  metadata: string[];
}

export interface FullPrivacyImporterState extends BaseImporterState {
  type: ImporterStateTypes.fullPrivacy;
  metadata: string[];
}

export type ImporterState = PrivacyImporterState;
