#!/bin/sh

source /app/apps/server/scripts/run/deprecated.sh

cd apps/server && yarn build && yarn migrate && yarn dev