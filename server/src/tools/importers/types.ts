export interface PrivacyItem {
  endTime: string;
  artistName: string;
  trackName: string;
  msPlayed: number;
}

export interface HistoryImporter {
  init: (filePaths: string[]) => Promise<boolean>;
  run: () => Promise<boolean>;
  // undefined if initializing
  getProgress: () => [number, number] | undefined;
}
