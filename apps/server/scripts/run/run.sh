#!/bin/sh
set -e

source /app/apps/server/scripts/run/deprecated.sh

cd apps/server
yarn migrate
exec yarn start
