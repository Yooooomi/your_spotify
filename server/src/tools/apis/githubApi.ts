import axios from 'axios';
import { Version } from '../version';

interface Author {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface Reactions {
  url: string;
  total_count: number;
  '+1': number;
  '-1': number;
  laugh: number;
  hooray: number;
  confused: number;
  heart: number;
  rocket: number;
  eyes: number;
}

export interface Release {
  url: string;
  assets_url: string;
  upload_url: string;
  html_url: string;
  id: number;
  author: Author;
  node_id: string;
  tag_name: string;
  target_commitish: string;
  name: string;
  draft: boolean;
  prerelease: boolean;
  created_at: Date;
  published_at: Date;
  tarball_url: string;
  zipball_url: string;
  body: string;
  reactions: Reactions;
  mentions_count?: number;
}

export class GithubAPI {
  static async releases() {
    const { data: releases } = await axios.get(
      'https://api.github.com/repos/yooooomi/your_spotify/releases',
    );
    return releases as Release[];
  }

  static async lastPackageJsonVersion() {
    const { data: file } = await axios.get(
      'https://raw.githubusercontent.com/Yooooomi/your_spotify/master/server/package.json',
    );
    const content = JSON.parse(file);
    return Version.from(content.version);
  }
}
