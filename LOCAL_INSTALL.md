
# Local installation (no docker)

## Prerequisites

You will need to have
- A mongo database
- NodeJS

## Hosting backend

- Go to the server directory and `yarn` in it
- Run `yarn build`
- Run `yarn migrate` with the right environment variables
- Run `node lib/bin/www.js` the right environment variables

The environment variables are the same as in the docker-compose for server:
  - API_ENDPOINT=http://localhost:8080 # This MUST be included as a valid URL in the spotify dashboard
  - CLIENT_ENDPOINT=http://localhost:3000
  - SPOTIFY_PUBLIC=your_spotify_client_id
  - SPOTIFY_SECRET=your_spotify_secret
  - CORS=http://localhost:3000,http://localhost:3001


## Hosting client

- Go to the client directory and `yarn` in it
- Run `yarn build`
- In the build directory produced, copy `variables.js` into `variables-final.js` and replace the endpoint with the API_ENDPOINT, that is the endpoint of your backend
- Host the static website in the build directory the way you want, I personally use `serve`

> Note that you need to redirect all 404 errors to index.html, serve does this by default
