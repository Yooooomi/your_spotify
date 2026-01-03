#!/bin/sh
set -e

source /app/apps/server/scripts/run/deprecated.sh

cd apps/server
node /app/apps/server/build/index.js --migrate
exec node /app/apps/server/build/index.js
