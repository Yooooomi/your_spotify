#!/bin/sh

cd client && docker build -f Dockerfile.production . -t fabalexsie/your_spotify_client:latest ; cd -
cd server && docker build -f Dockerfile.production . -t fabalexsie/your_spotify_server:latest ; cd -