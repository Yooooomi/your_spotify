![Client CI](https://github.com/Yooooomi/your_spotify/workflows/Client%20CI/badge.svg)
![Server CI](https://github.com/Yooooomi/your_spotify/workflows/Server%20CI/badge.svg)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=BLAPT49PK9A8G)

<p align='center'>
  <img width="100%" src="https://user-images.githubusercontent.com/17204739/154752226-c2215a51-e20e-4ade-ac63-42c5abb25240.png">
</p>

# Your Spotify

**YourSpotify** is a self-hosted application that tracks what you listen and offers you a dashboard to explore statistics about it!
It's composed of a web server which polls the Spotify API every now and then and a web application on which you can explore your statistics.

# Table of contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
  - [Using docker](#using-docker-compose)
  - [Installing locally](#installing-locally-not-recommended)
  - [Environment](#environment)
  - [CORS](#cors)
- [Creating the Spotify application](#creating-the-spotify-application)
- [Importing past history](#importing-past-history)
  - [Supported import methods](#supported-import-methods)
    - [Privacy data](#privacy-data)
    - [Full privacy data](#full-privacy-data)
  - [Troubleshoot](#troubleshoot)
- [FAQ](#faq)
- [External guides](#external-guides)
- [Contributing](#contributing)
- [Sponsoring](#sponsoring)

# Prerequisites

1. You have to own a Spotify application ID that you can create through their [dashboard](https://developer.spotify.com/dashboard/applications).
2. You need to provide the **Server** environment the **public** AND **secret** key of the application (cf. [Installation](#installation)).
3. You need to provide an **authorized** redirect URI to the `docker-compose` file.

> A tutorial is available at the end of this readme.

# Installation

## Using `docker-compose`

Follow the [docker-compose-example.yml](https://github.com/Yooooomi/your_spotify/blob/master/docker-compose-example.yml) to host your application through docker.

```yml
services:
  server:
    image: yooooomi/your_spotify_server
    restart: always
    ports:
      - "8080:8080"
    links:
      - mongo
    depends_on:
      - mongo
    environment:
      API_ENDPOINT: http://localhost:8080 # This MUST be included as a valid URL in the spotify dashboard (see below)
      CLIENT_ENDPOINT: http://localhost:3000
      SPOTIFY_PUBLIC: __your_spotify_client_id__
      SPOTIFY_SECRET: __your_spotify_secret__
  mongo:
    container_name: mongo
    image: mongo:6
    volumes:
      - ./your_spotify_db:/data/db

  web:
    image: yooooomi/your_spotify_client
    restart: always
    ports:
      - "3000:3000"
    environment:
      API_ENDPOINT: http://localhost:8080
```

> Some ARM-based devices might have trouble with Mongo >= 5. I suggest you use the image **mongo:4.4**.

## Installing locally (not recommended)

You can follow the instructions [here](https://github.com/Yooooomi/your_spotify/blob/master/LOCAL_INSTALL.md). Note that you will still have to do the steps below.

## Environment

| Key | Default value (if any) | Description |
| :--- | :--- | :--- |
| CLIENT_ENDPOINT       | REQUIRED | The endpoint of your web application |
| API_ENDPOINT          | REQUIRED | The endpoint of your server |
| SPOTIFY_PUBLIC        | REQUIRED | The public key of your Spotify application (cf [Creating the Spotify Application](#creating-the-spotify-application)) |
| SPOTIFY_SECRET        | REQUIRED | The secret key of your Spotify application (cf [Creating the Spotify Application](#creating-the-spotify-application)) |
| TIMEZONE              | Europe/Paris | The timezone of your stats, only affects read requests since data is saved with UTC time |
| MONGO_ENDPOINT        | mongodb://mongo:27017/your_spotify | The endpoint of the Mongo database, where **mongo** is the name of your service in the compose file |
| LOG_LEVEL             | info | The log level, debug is useful if you encouter any bugs |
| CORS                  | _not defined_ | List of comma-separated origin allowed (defaults to CLIENT_ENDPOINT) |
| COOKIE_VALIDITY_MS    | 1h | Validity time of the authentication cookie, following [this pattern](https://github.com/vercel/ms) |
| MAX_IMPORT_CACHE_SIZE | Infinite | The maximum element in the cache when importing data from an outside source, more cache means less requests to Spotify, resulting in faster imports |
| MONGO_NO_ADMIN_RIGHTS | false | Do not ask for admin right on the Mongo database |
| PORT                  | 8080 | The port of the server, **do not** modify if you're using docker |
| FRAME_ANCESTORS       | _not defined_ | Sites allowed to frame the website, comma separated list of URLs (`i-want-a-security-vulnerability-and-want-to-allow-all-frame-ancestors` to allow every website) |

## CORS

- Not defining it will default to authorize only the `CLIENT_ENDPOINT` origin.
- `origin1,origin2` will allow `origin1` and `origin2`.
> If you really want to allow every origin no matter what, you can set the `CORS` value to `i-want-a-security-vulnerability-and-want-to-allow-all-origins`.

# Creating the Spotify Application

For **YourSpotify** to work you need to provide a Spotify application **public** AND **secret** to the server environment.
To do so, you need to create a **Spotify application** [here](https://developer.spotify.com/dashboard/applications).

1. Click on **Create app**.
2. Fill out all the information.
3. Set the redirect URI, corresponding to your **server** location on the internet (or your local network) adding the suffix **/oauth/spotify/callback** (**/api/oauth/spotify/callback** if using the [linuxserver](https://github.com/linuxserver/docker-your_spotify) image).
- i.e: `http://localhost:8080/oauth/spotify/callback` or `http://home.mydomain.com/your_spotify_backend/oauth/spotify/callback`
4. Check **Web API**
5. Check **I understand and agree**
6. Hit **Settings** at the top right corner
7. Copy the **public** and the **secret** key into your `docker-compose` file under the name of `SPOTIFY_PUBLIC` and `SPOTIFY_SECRET`
   respectively.
8. Once you have created your application, Spotify wants you to register the users that will be able to access the application. (You don't need to do that for the account that created the application)
   1. Click the **User Management** button
   2. Enter the required information, a name and the email the user's Spotify account has been created with.
   3. (Optional) You can **Request extension** if you do not want to register the users by hand.

# Importing past history

By default, **YourSpotify** will only retrieve data for the past 24 hours once registered. This is a technical limitation. However, you can import previous data by two ways.

The import process uses cache to limit requests to the Spotify API. By default, the cache size is unlimited, but you can limit is with the `MAX_IMPORT_CACHE_SIZE` env variable in the **server**.

## Supported import methods

### Privacy data

> Takes a maximum of 5 days.
> Only gets you the last year of history.

- Request your **privacy data** at Spotify to have access to your history for the past year [here](https://www.spotify.com/us/account/privacy/).
- Head to the **Settings** page and choose the **Account data** method.
- Input your files starting with `StreamingHistoryX.json`.
- Start your import.

### Full privacy data (recommended)

> Takes a maximum of 30 days.
> Gets you the whole history since the creation of your account.

- Request your **Full privacy data** to have access to your history data since the creation of the account [here](https://www.spotify.com/us/account/privacy/).
- Head to the **Settings** page and choose the **Extended streaming history** method.
- Input your files starting with `endsongX.json`.
- Start your import.

## Troubleshoot

An import can fail:
- If the server reboots.
- If a request fails 10 times in a row.

A failed import can be retried in the **Settings** page. Be sure to clean your failed imports if you do not want to retry it as it will remove the files used for it.

It is safer to import data at account creation. Though **YourSpotify** detects duplicates, some may still be inserted.

# FAQ

> How can I block new registrations?

From an admin account, go to the **Settings** page and hit the **Disable new registrations** button.

> Songs don't seem to synchronize anymore.

This can happen if you revoked access on your Spotify account. To re-sync the songs, go to settings and hit the **Relog to Spotify** button.

> The web application is telling me it cannot retrieve global preferences.

This means that your web application can't connect to the backend. Check that your **API_ENDPOINT** env variable is reachable from the device you're using the platform from.

> A specific user does not use the application in the same timezone as the server, how can I set a specific timezone for him?

Any user can set his proper timezone in the settings, it will be used for any computed statistics. The timezone of the device will be used for everything else, such as song history.

# External guides

- [BreadNet](https://breadnet.co.uk/your-spotify-2022) installation tutorial

# Contributing

If you have any issue or any idea that could make the project better, feel free to open an [issue](https://github.com/Yooooomi/your_spotify/issues/new/choose). I'd love to hear about new ideas or bugs you are encountering.

# Sponsoring

I work on this project on my spare time and try to fix issues as soon as I can. If you feel generous and think this project and my investment are worth a few cents, you can consider sponsoring it with the button on the right, many thanks.
