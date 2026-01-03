#!/bin/sh
set -e

source /app/apps/client/scripts/run/variables.sh

cd /app/apps/client
exec pnpm start
