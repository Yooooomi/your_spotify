#!/bin/sh

docker-compose -f base.yml -f dev.yml --env-file=dev.env up --build
