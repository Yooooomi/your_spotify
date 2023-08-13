#!/bin/sh

source /app/scripts/run/deprecated.sh

yarn build && yarn migrate && yarn dev