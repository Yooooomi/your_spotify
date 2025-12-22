#!/bin/sh
set -e

source /app/apps/server/scripts/run/deprecated.sh

cd apps/server
pnpm build
pnpm migrate
exec pnpm dev
