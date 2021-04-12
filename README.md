![Client CI](https://github.com/Yooooomi/your_spotify/workflows/Client%20CI/badge.svg)
![Server CI](https://github.com/Yooooomi/your_spotify/workflows/Server%20CI/badge.svg)

<p align='center'>
  <img width="100%" src="https://i.imgur.com/wbOhp0F.png">
</p>

# Your Spotify

Your Spotify is a self-hosted application that tracks what you listen and offers you a dashboard to explore statistics about it!
It's composed of a web server which polls the Spotify API every now and then and a web application on which you can explore your statistics.

# Prerequisites

1) You have to own a Spotify application ID that you can create through their [dashboard](https://developer.spotify.com/dashboard/applications)
2) You need to provide the __Server__ environment the __public__ AND __secret__ key of the application (cf. [Installation](#Installation))
3) You need to provide an __authorized__ redirect URI to the `docker-compose` file

> A tutorial is available at the end of this readme.

# Installation

## Using `docker-compose`

Follow the [docker-compose-example.yml](https://github.com/Yooooomi/your_spotify/blob/master/docker-compose-example.yml) to host your application through docker

```yml
version: "3"

services:
  app:
    image: yooooomi/your_spotify_server
    container_name: express-mongo
    restart: always
    ports:
      - "8080:8080"
    links:
      - mongo
    depends_on:
      - mongo
    environment:
      - API_ENDPOINT=http://localhost:8080 # This MUST be included as a valid URL in the spotify dashboard
      - CLIENT_ENDPOINT=http://localhost:3000
      - SPOTIFY_PUBLIC=__your_spotify_client_id__
      - SPOTIFY_SECRET=__your_spotify_secret__
      - CORS=http://localhost:3000,http://localhost:3001
      #- CORS=all
      #- MONGO_ENDPOINT=mongodb://mongo:27017/your_spotify
  mongo:
    container_name: mongo
    image: mongo
    volumes:
      - ./your_spotify_db:/data/db

  web:
    image: yooooomi/your_spotify_client
    container_name: web
    restart: always
    ports:
      - "3000:3000"
    environment:
      - API_ENDPOINT=http://localhost:8080

```

## CORS

You can edit the CORS for the server:

- `all` will allow every source
- `origin1,origin2` will allow `origin1` and `origin2`

# Creating the Spotify Application

For __Your spotify__ to work you need to provide a Spotify application __public__ AND __secret__ to the server environment.
To do so, you need to create a __Spotify application__ [here](https://developer.spotify.com/dashboard/applications).

1) Click on __Create a client ID__
2) Fill out all the informations
3) Copy the __public__ and the __secret__ key into your `docker-compose` file under the name of `SPOTIFY_PUBLIC` and `SPOTIFY_SECRET`
respectively
4) Add an authorized redirect URI corresponding to your __server__ location on the internet adding the suffix __/oauth/spotify/callback__,
    1) use the `EDIT SETTINGS` button on the top right corner of the page.
    2) add your URI under the `Redirect URIs` section
    - i.e: `http://localhost:3000/oauth/spotify/callback` or `http://home.mydomain.com/your_spotify_backend/oauth/spotify/callback`

# Blocking new registrations

You can now block new registrations from the settings page if you created an account. Every account can block or allow new registrations.
