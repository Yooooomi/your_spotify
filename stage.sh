#!/bin/sh

docker-compose -f base.yml -f stage.yml --env-file=prod.env up --build
