# Your Spotify server

## Table of Contents
- [Prometheus](#prometheus)
- [API](#api)
  - [Authentication](#authentication)
    - [OAuth](#oauth)
  - [User Management](#user-management)
    - [Account](#account)
    - [Admin](#admin)
  - [Spotify Integration](#spotify-integration)
    - [Playback](#playback)
    - [Playlist Management](#playlist-management)
  - [History & Statistics](#history--statistics)
    - [Top Items](#top-items)
    - [Collaborative Features](#collaborative-features)
  - [Search](#search)
  - [Artist](#artist)
  - [Album](#album)
  - [Track](#track)
  - [Import](#import)
  - [Global Preferences](#global-preferences)
  - [Account Settings](#account-settings)

## Prometheus

You can access various prometheus metrics through `/metrics`:

- **http_requests_total**: Total number of HTTP requests
- **http_request_duration_nanoseconds**: Duration of HTTP requests in nanoseconds
- **imports_total**: Total number of imports
- **ingested_tracks_total**: Total number of ingested tracks from Spotify API
- **ingested_albums_total**: Total number of ingested albums from Spotify API
- **ingested_artists_total**: Total number of ingested artists from Spotify API

You will need to define to environment variable in the server:

- **PROMETHEUS_USERNAME**: the basic auth username expected by the server to authorize the request
- **PROMETHEUS_PASSWORD**: the expected password

Those values are to be referenced in the configuration of your Prometheus instance:

```yml
scrape_configs:
  - job_name: "your_spotify"
    basic_auth:
      username: "myuser"      # PROMETHEUS_USERNAME
      password: "mypassword"  # PROMETHEUS_PASSWORD
    static_configs:
      - targets: ["example.com:443"]
```

## API

## Authentication

### OAuth

#### `GET /oauth/spotify`
Initiates Spotify OAuth flow.

**Response:**
- Redirects to Spotify login page
- For development: Returns 204 if offline mode enabled

#### `GET /oauth/spotify/callback`
Handles Spotify OAuth callback.

**Query Parameters:**
- `code`: string - OAuth code from Spotify
- `state`: string - State parameter for security

**Response:**
- Redirects to client application

#### `GET /oauth/spotify/me`
Gets current user's Spotify profile.

**Response:** 
- `200`: Spotify user profile
- `500`: Error with code "SPOTIFY_ERROR"

## User Management

### Account

#### `GET /me`
Get current user information.

**Response:**
```json
{
  "status": boolean,
  "user": UserObject // Only if status is true
}
```

#### `GET /accounts`
Get list of all users (requires authentication).

**Response:**
```json
[{
  "id": string,
  "username": string,
  "admin": boolean,
  "firstListenedAt": Date
}]
```

#### `PUT /rename`
Change username.

**Body:**
```json
{
  "newName": string // 2-64 characters
}
```

**Response:**
- `204`: Success
- `500`: Error

### Admin

#### `PUT /admin/:id`
Set user admin status (requires admin).

**Parameters:**
- `id`: User ID

**Body:**
```json
{
  "status": boolean
}
```

**Response:**
- `204`: Success
- `400`: Error if trying to remove last admin
- `500`: Error

#### `DELETE /account/:id`
Delete user account (requires admin).

**Parameters:**
- `id`: User ID

**Response:**
- `204`: Success
- `404`: User not found
- `500`: Error

## Spotify Integration

### Playback

#### `POST /spotify/play`
Start playback of a track.

**Body:**
```json
{
  "id": string // Spotify track ID
}
```

**Response:**
- `200`: Success
- `400`: Invalid track or playback error
- `500`: Server error

### Playlist Management

#### `GET /spotify/playlists`
Get user's Spotify playlists.

**Response:**
- `200`: Array of user's Spotify playlists

#### `POST /spotify/playlist/create`
Create a new Spotify playlist or add tracks to existing playlist.

**Body:**
```json
{
  "playlistId": string?, // Existing playlist ID (optional)
  "name": string?, // New playlist name (optional)
  "sortKey": string?, // Sort key for tracks (default "count")
  "type": "top" | "affinity" | "single", // Playlist type
  
  // For type "top"
  "interval": {
    "start": date,
    "end": date
  },
  "nb": number, // Number of tracks to include
  
  // For type "affinity"
  "interval": {
    "start": date,
    "end": date
  },
  "nb": number, // Number of tracks to include
  "userIds": string[], // User IDs for collaboration
  "mode": "intersection" | "union", // Collaboration mode
  
  // For type "single"
  "songId": string // Single track ID to add
}
```

**Response:**
- `204`: Successfully created or updated playlist
- `400`: Invalid request
- `500`: Server error

## History & Statistics

#### `GET /spotify/gethistory`
Get user's listening history.

**Query Parameters:**
- `number`: number - Maximum number of items to return (max 20)
- `offset`: number - Number of items to skip
- `start`: date (optional) - Start date
- `end`: date (optional) - End date

**Response:**
- `200`: Array of listening history items

#### `GET /spotify/listened_to`
Get count of songs listened to in a time period.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)

**Response:**
- `200`: `{ count: number }`

#### `GET /spotify/most_listened`
Get most listened songs in a time period.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)

**Response:**
- `200`: Array of most listened songs with counts

#### `GET /spotify/most_listened_artist`
Get most listened artists in a time period.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)

**Response:**
- `200`: Array of most listened artists with counts

#### `GET /spotify/songs_per`
Get song count per time unit.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)

**Response:**
- `200`: Array of time periods with song counts

#### `GET /spotify/time_per`
Get listening time per time unit.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)

**Response:**
- `200`: Array of time periods with listening durations

#### `GET /spotify/album_date_ratio`
Get album release date distribution for listened tracks.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)

**Response:**
- `200`: Distribution of tracks by album release date

#### `GET /spotify/feat_ratio`
Get ratio of songs featuring multiple artists.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)

**Response:**
- `200`: Ratio data for featured vs. non-featured tracks

#### `GET /spotify/popularity_per`
Get popularity metrics of listened tracks.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)

**Response:**
- `200`: Popularity distribution over time

#### `GET /spotify/different_artists_per`
Get count of unique artists listened to per time unit.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)

**Response:**
- `200`: Count of unique artists per time unit

#### `GET /spotify/time_per_hour_of_day`
Get listening distribution by hour of day.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)

**Response:**
- `200`: Distribution of listening time by hour

#### `GET /spotify/best_artists_per`
Get top artists per time unit.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)

**Response:**
- `200`: Top artists for each time unit

### Top Items

#### `GET /spotify/top/songs`
Get top songs in a time period.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `nb`: number - Number of items to return (1-30)
- `offset`: number - Number of items to skip (default 0)
- `sortKey`: string - Sort criteria (default "count")

**Response:**
- `200`: Array of top song objects

#### `GET /spotify/top/artists`
Get top artists in a time period.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `nb`: number - Number of items to return (1-30)
- `offset`: number - Number of items to skip (default 0)
- `sortKey`: string - Sort criteria (default "count")

**Response:**
- `200`: Array of top artist objects

#### `GET /spotify/top/albums`
Get top albums in a time period.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `nb`: number - Number of items to return (1-30)
- `offset`: number - Number of items to skip (default 0)
- `sortKey`: string - Sort criteria (default "count")

**Response:**
- `200`: Array of top album objects

#### `GET /spotify/top/hour-repartition/songs`
Get top songs by hour of day.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)

**Response:**
- `200`: Top songs for each hour of the day

#### `GET /spotify/top/hour-repartition/albums`
Get top albums by hour of day.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)

**Response:**
- `200`: Top albums for each hour of the day

#### `GET /spotify/top/hour-repartition/artists`
Get top artists by hour of day.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)

**Response:**
- `200`: Top artists for each hour of the day

#### `GET /spotify/top/sessions`
Get longest listening sessions.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)

**Response:**
- `200`: Array of listening session data

### Collaborative Features

#### `GET /spotify/collaborative/top/songs`
Get shared top songs between multiple users.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)
- `otherIds`: string[] - Array of other user IDs to compare with
- `mode`: string - Collaboration mode (intersection, union)

**Response:**
- `200`: Array of shared top songs

#### `GET /spotify/collaborative/top/albums`
Get shared top albums between multiple users.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)
- `otherIds`: string[] - Array of other user IDs to compare with
- `mode`: string - Collaboration mode (intersection, union)

**Response:**
- `200`: Array of shared top albums

#### `GET /spotify/collaborative/top/artists`
Get shared top artists between multiple users.

**Query Parameters:**
- `start`: date - Start date
- `end`: date - End date (defaults to current time)
- `timeSplit`: string - Time unit for grouping (day, week, month, year)
- `otherIds`: string[] - Array of other user IDs to compare with
- `mode`: string - Collaboration mode (intersection, union)

**Response:**
- `200`: Array of shared top artists

## Search

#### `GET /search/:query`
Search across tracks, artists and albums.

**Parameters:**
- `query`: Search term (3-64 characters)

**Response:**
```json
{
  "artists": Artist[],
  "tracks": Track[],
  "albums": Album[]
}
```

## Artist

#### `GET /artist/:ids`
Get artist details.

**Parameters:**
- `ids`: Comma-separated artist IDs

#### `GET /artist/:id/stats`
Get artist statistics.

**Parameters:**
- `id`: Artist ID

**Response:**
```json
{
  "artist": ArtistObject,
  "firstLast": FirstLastObject,
  "mostListened": TrackObject,
  "albumMostListened": AlbumObject,
  "bestPeriod": PeriodStats,
  "total": TotalStats,
  "dayRepartition": DayStats
}
```

#### `GET /artist/search/:query`
Search for artists by name.

**Parameters:**
- `query`: Search term (3-64 characters)

**Response:**
- `200`: Array of matching artists

#### `POST /artist/blacklist/:id`
Blacklist an artist.

#### `POST /artist/unblacklist/:id`
Remove artist from blacklist.

#### `GET /artist/:id/rank`
Get artist's ranking among all artists.

**Parameters:**
- `id`: Artist ID

**Response:**
- Artist ranking information

## Album

#### `GET /album/:ids`
Get album details.

**Parameters:**
- `ids`: Comma-separated album IDs

#### `GET /album/:id/stats`
Get album statistics.

**Parameters:**
- `id`: Album ID

**Response:**
```json
{
  "album": AlbumObject,
  "artists": Artist[],
  "firstLast": FirstLastObject,
  "tracks": Track[]
}
```

#### `GET /album/:id/rank`
Get album's ranking among all albums.

**Parameters:**
- `id`: Album ID

**Response:**
- Album ranking information

## Track

#### `GET /track/:ids`
Get track details.

**Parameters:**
- `ids`: Comma-separated track IDs

#### `GET /track/:id/stats`
Get track statistics.

**Parameters:**
- `id`: Track ID

**Response:**
```json
{
  "track": TrackObject,
  "artist": ArtistObject,
  "album": AlbumObject,
  "bestPeriod": PeriodStats,
  "firstLast": FirstLastObject,
  "recentHistory": HistoryObject,
  "total": TotalStats
}
```

#### `GET /track/:id/rank`
Get track's ranking among all tracks.

**Parameters:**
- `id`: Track ID

**Response:**
- Track ranking information

## Import

#### `POST /import/privacy`
Import privacy data.

**Body:**
- Multipart form with files named "imports"

**Response:**
```json
{
  "code": "IMPORT_STARTED" | "IMPORT_INIT_FAILED"
}
```

#### `POST /import/retry`
Retry failed import.

**Body:**
```json
{
  "existingStateId": string
}
```

#### `DELETE /import/clean/:id`
Clean up import.

**Parameters:**
- `id`: Import ID

#### `GET /imports`
Get import status.

## Global Preferences

#### `GET /global/preferences`
Get global application preferences.

#### `POST /global/preferences`
Update global preferences (admin only).

**Body:**
```json
{
  "allowRegistrations": boolean
}
```

## Account Settings

#### `POST /settings`
Update user settings.

**Body:**
```json
{
  "historyLine": boolean?,
  "preferredStatsPeriod": "day" | "week" | "month" | "year"?,
  "nbElements": number?, // 5-50
  "metricUsed": "number" | "duration"?,
  "darkMode": "follow" | "dark" | "light"?,
  "timezone": string?,
  "dateFormat": string?
}
```

#### `POST /generate-public-token`
Generate new public access token.

#### `POST /delete-public-token`
Delete public access token.
