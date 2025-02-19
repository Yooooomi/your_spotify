#!/bin/sh
set -e

source /app/apps/server/scripts/run/deprecated.sh

cd apps/server
yarn build
yarn migrate
exec yarn dev
