# Repository Guidelines

## Project Structure & Modules
- Root: Yarn workspaces monorepo (`apps/*`).
- `apps/client`: React + TypeScript web UI (Create React App).
- `apps/server`: Node/Express + TypeScript API and migrations.
- `apps/dev`: Shared lint/format config for workspaces.
- Docker: `docker-compose-*.yml`, `Dockerfile.*` to build/run images.
- Data: `your_spotify_db/` and `db_data/` are local MongoDB volumes.

## Build, Test, and Development
- Client dev: `yarn workspace @your_spotify/client start` — run CRA dev server on `:3000`.
- Server dev: `yarn workspace @your_spotify/server dev` — nodemon TypeScript entry.
- Build client: `yarn workspace @your_spotify/client build` — static production build.
- Build server: `yarn workspace @your_spotify/server build` — compile to `apps/server/lib/`.
- Lint (all): run from root `yarn workspace @your_spotify/client lint` and `yarn workspace @your_spotify/server lint`.
- Docker (local): `./dev.sh` or `docker compose -f docker-compose-dev.yml up --build`.

## Coding Style & Naming
- Language: TypeScript (server, client). Indent 2 spaces.
- Prettier (client/server): semicolons; single quotes; trailing commas; width 80; `arrowParens: avoid`.
- ESLint rules from `apps/dev/.eslintrc.js` with import ordering and no default exports (server).
- Naming: `PascalCase` React components/directories (e.g., `components/Header`); `camelCase` vars/functions; `SCREAMING_SNAKE_CASE` env keys.

## Testing Guidelines
- Framework: CRA/Jest for client (`*.test.tsx`). No formal server test setup in repo.
- Place tests next to source files and mirror structure.
- Run client tests: `yarn workspace @your_spotify/client test` (watch mode).
- Aim for tests on pure utilities in `apps/client/src/services/` when adding logic.

## Commit & Pull Requests
- Commits: concise, imperative (“Add”, “Fix”, “Update”). Prefix scope when useful: `server:`, `client:`. Reference issues (`#123`).
- PRs: include summary, rationale, and testing steps. Link related issues. For UI changes, add screenshots/GIFs. Note any env var or migration changes.

## Security & Configuration
- Do not commit secrets. Provide `SPOTIFY_PUBLIC`/`SPOTIFY_SECRET`, `API_ENDPOINT`, `CLIENT_ENDPOINT` via compose/env.
- For multiple frontends, set `CORS` explicitly; consider `FRAME_ANCESTORS` for embedding restrictions.
- Local-only volumes (`db_data`, `your_spotify_db`) should not be checked in.
