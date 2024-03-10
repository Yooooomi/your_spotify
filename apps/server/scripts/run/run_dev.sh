#!/bin/sh

source /app/apps/server/scripts/run/deprecated.sh

cd apps/server && yarn build && yarn migrate && yarn dev -o --legacy-watch --watch "src/**" --ext "ts,json" --ignore "src/**/*.spec.ts" --exec "ts-node src/index.ts"