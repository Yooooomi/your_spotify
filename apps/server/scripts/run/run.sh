#!/bin/sh

source /app/apps/server/scripts/run/deprecated.sh

cd apps/server && yarn migrate && yarn start