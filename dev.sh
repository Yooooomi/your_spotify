#!/bin/sh

# docker-compose-personal.yml is local only overriding spotify public and secret for development
docker-compose -f docker-compose.yml -f docker-compose-dev.yml -f docker-compose-personal.yml up --build --attach app --attach web