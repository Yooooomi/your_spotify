#!/bin/sh
set -e

# Setup API variable
source /app/apps/client/scripts/run/variables.sh

# Host the static website
exec /app/apps/client/scripts/run/serve.sh
