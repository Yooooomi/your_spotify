# ISRC Track Deduplication Migration Guide

Spotify can assign multiple track IDs to the same recording when a song appears
on different releases, such as a standard album, deluxe edition, single, or
compilation. YourSpotify historically stored listen history by Spotify track ID,
so those versions could appear as separate songs in stats.

This feature stores Spotify's ISRC (`external_ids.isrc`) on tracks and can merge
existing duplicates so listens for the same recording point to one canonical
track.

The migration is optional, but recommended if you already have listening history
in your database.

## Which Commands Should I Use?

Most self-hosted installations use a copy of `docker-compose-example.yml` and
start YourSpotify with:

```bash
docker compose up -d
```

That compose file uses published Docker images and names the server service
`server`, so the main commands in this guide use:

```bash
docker compose exec server ...
```

If you are developing from this repository with `docker-compose-prod.yml` and
`docker-compose-personal.yml`, use the alternative commands in the
[Repository Development Compose](#repository-development-compose) section.

## Before You Start

Make sure:

- Your `yooooomi/your_spotify_server` image has been updated to a version that
  contains this migration.
- MongoDB is running and reachable by the server container.
- `SPOTIFY_PUBLIC` and `SPOTIFY_SECRET` are configured. The migration uses them
  to fetch missing ISRCs from Spotify.
- You can run `docker compose` from the directory containing your compose file.

Update the published images and restart the app:

```bash
docker compose pull
docker compose up -d
```

## Step 1: Back Up MongoDB

Create a backup before applying the migration.

```bash
docker compose exec mongo \
  mongodump --archive=/tmp/your_spotify-before-isrc.archive --db your_spotify
```

Copy the backup from the Mongo container to your host:

```bash
docker compose cp \
  mongo:/tmp/your_spotify-before-isrc.archive ./your_spotify-before-isrc.archive
```

Keep this file until you have verified the migration result.

If your Mongo service has a different name, replace `mongo` with that service
name.

## Step 2: Run A Dry Run

The migration defaults to dry-run mode. It will inspect the database, fetch
missing ISRCs from Spotify, choose primary tracks, and write a report without
changing the database.

```bash
docker compose exec server \
  node /app/apps/server/build/index.js --merge-tracks-by-isrc \
  --report=/tmp/isrc-dry-run-report.md
```

Copy the report to your host:

```bash
docker compose cp \
  server:/tmp/isrc-dry-run-report.md ./isrc-dry-run-report.md
```

Open `isrc-dry-run-report.md` and check:

- How many duplicate ISRC groups were found.
- Which track was selected as the primary for each group.
- Which secondary tracks would be merged.
- Whether the selected primary tracks look reasonable.

## Step 3: Apply The Migration

Only run apply mode after reviewing the dry-run report.

```bash
docker compose exec server \
  node /app/apps/server/build/index.js --merge-tracks-by-isrc \
  --apply \
  --report=/tmp/isrc-merge-report.md
```

Copy the final report to your host:

```bash
docker compose cp \
  server:/tmp/isrc-merge-report.md ./isrc-merge-report.md
```

Keep this report with your backup. It documents the selected primary tracks,
merged secondary tracks, play counts, updated listen records, and final totals.

## Step 4: Verify The Result

Start or restart the app normally, then check your stats for songs that
previously appeared as duplicates.

You can also run another dry run:

```bash
docker compose exec server \
  node /app/apps/server/build/index.js --merge-tracks-by-isrc \
  --report=/tmp/isrc-post-migration-audit.md
```

Copy the audit report:

```bash
docker compose cp \
  server:/tmp/isrc-post-migration-audit.md ./isrc-post-migration-audit.md
```

After a successful migration, this report should show no remaining duplicate
groups, or fewer groups if Spotify does not provide ISRCs for some tracks. It
also includes an audit section for tracks already marked with `mergedInto`.

## What The Migration Changes

For each duplicate ISRC group, the migration:

1. Chooses a primary track.
2. Updates listen records from secondary track IDs to the primary track ID.
3. Marks secondary track documents with `mergedInto`.
4. Keeps the primary track's `isrc`.
5. Removes `isrc` from secondary tracks so the sparse unique index remains valid.

Secondary track documents are not deleted. They are kept for auditability.

## Album And Track Counts

After deduplication, track stats are recording-level while album stats remain
release-level.

For example, if you listened to the same recording twice on an album and once on
an EP, the artist page can show that track with 3 listens. The album page for
the album will still show 2 listens for that track, and the EP can still count
the remaining listen for that release.

## If You Do Not Run The Migration

The app still works if you upgrade without running this migration.

- Existing history remains unchanged.
- Existing duplicate tracks remain separate.
- New tracks store ISRCs when Spotify provides them.
- New listens can deduplicate against tracks that already have an ISRC.
- Tracks without ISRC keep the old Spotify-ID behavior.

Run the migration when you want to clean up historical duplicates.

## Rollback

The safest rollback is restoring the MongoDB backup created in step 1.

Stop the app services that write to MongoDB, then copy the backup archive into
the Mongo container:

```bash
docker compose cp \
  ./your_spotify-before-isrc.archive mongo:/tmp/your_spotify-before-isrc.archive
```

Restore it:

```bash
docker compose exec mongo \
  mongorestore --drop --archive=/tmp/your_spotify-before-isrc.archive --nsInclude='your_spotify.*'
```

Then restart the app:

```bash
docker compose up -d
```

## Repository Development Compose

If you are running this repository directly with `docker-compose-prod.yml` and
`docker-compose-personal.yml`, the server service is named `app`. Use this
compose prefix:

```bash
docker compose -f docker-compose-prod.yml -f docker-compose-personal.yml
```

Example dry run:

```bash
docker compose -f docker-compose-prod.yml -f docker-compose-personal.yml exec app \
  node /app/apps/server/build/index.js --merge-tracks-by-isrc \
  --report=/tmp/isrc-dry-run-report.md
```

Example apply:

```bash
docker compose -f docker-compose-prod.yml -f docker-compose-personal.yml exec app \
  node /app/apps/server/build/index.js --merge-tracks-by-isrc \
  --apply \
  --report=/tmp/isrc-merge-report.md
```

## Local Development Without Docker

If you are not using Docker and have dependencies installed locally:

```bash
cd apps/server
pnpm run merge-tracks-by-isrc -- --report=/tmp/isrc-dry-run-report.md
pnpm run merge-tracks-by-isrc -- --apply --report=/tmp/isrc-merge-report.md
```
