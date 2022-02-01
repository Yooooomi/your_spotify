cd client && docker build -f Dockerfile.production . -t yooooomi/your_spotify_client:latest ; cd -
cd server && docker build -f Dockerfile.production . -t yooooomi/your_spotify_server:latest ; cd -