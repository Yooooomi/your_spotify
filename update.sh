#!/bin/sh

docker compose down
git pull
build.sh
docker compose up --build --detach
