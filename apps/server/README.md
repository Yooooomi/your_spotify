# Your Spotify server

## Table of Contents
- [Prometheus](#prometheus)
- [API](#api)
  - [Authentication](#authentication)
    - [OAuth Routes](#oauth-routes)
  - [User Management](#user-management)
    - [Account Routes](#account-routes)
    - [Admin Routes](#admin-routes)
  - [Spotify Integration](#spotify-integration)
    - [Playback Routes](#playback-routes)
  - [Search](#search)
  - [Artist Routes](#artist-routes)
  - [Album Routes](#album-routes)
  - [Track Routes](#track-routes)
  - [Import Routes](#import-routes)
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

### OAuth Routes

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

### Account Routes

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

### Admin Routes

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

### Playback Routes

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

## Artist Routes

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

#### `POST /artist/blacklist/:id`
Blacklist an artist.

#### `POST /artist/unblacklist/:id`
Remove artist from blacklist.

## Album Routes

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

## Track Routes

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

## Import Routes

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
