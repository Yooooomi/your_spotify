# Local installation (no docker)

## Prerequisites

You will need to have

- Git clone of this repo (you can `git clone git@github.com:Yooooomi/your_spotify.git --depth=1`)
- A mongo database
- NodeJS

## Hosting backend

- Go to the server directory and `yarn` in it
- Run `yarn build`
- Run `yarn migrate` with the right environment variables
- Run `node lib/bin/www.js` the right environment variables

The environment variables are the same as in the docker-compose for server, with an additional `PORT` variable you can set.

## Hosting client

- Go to the client directory and `yarn` in it
- Run `yarn build`
- In the build directory produced, copy `variables.js` into `variables-final.js` and replace the endpoint with the API_ENDPOINT, that is the endpoint of your backend
- Host the static website in the build directory the way you want, I personally use `serve`

> Note that you need to redirect all 404 errors to index.html, serve does this by default.
> You can find an `.htaccess` file for Apache2.

### Using systemd user unit

You can have the Mongo and backend running through systemd user units.

- Create a systemd unit file in your home directory at `.config/systemd/user/` (create the folders if they don't exist) and name it something like `your_spotify.service`.

File content should be something like (seperate one for MongoDB if needed):

```
[Unit]
Description=Your Spotify Backend
Wants=network-online.target mongodb.service
After=syslog.target network.target nss-lookup.target network-online.target

[Service]
EnvironmentFile=/home/YOUR_USER/sites/applications/spotify/your_spotify/server/.env
ExecStart=/home/YOUR_USER/.nvm/versions/node/v16.14.0/bin/node lib/bin/www
StandardOutput=journal
Restart=on-failure
WorkingDirectory=/home/YOUR_USER/sites/applications/spotify/your_spotify/server

[Install]
WantedBy=multi-user.target
```

> Refrenced env file only has the ENV variables in it.

Example MongoDB version of the systemd unit file:

```
[Unit]
Description=MongoDB
Wants=network-online.target
After=syslog.target network.target nss-lookup.target network-online.target

[Service]
Type=forking
ExecStart=/home/YOUR_USER/filesystem/bin/mongod --dbpath /home/YOUR_USER/filesystem/var/lib/mongo --logpath /home/YOUR_USER/filesystem/var/log/mongodb/mongod.log --fork --bind_ip 127.0.0.1 --port 40097
StandardOutput=journal
Restart=on-failure
WorkingDirectory=/home/YOUR_USER/filesystem/

[Install]
WantedBy=multi-user.target
```

- Enable the services and start them with `systemctl --user --now enable mongodb` and `systemctl --user --now enable your_spotify`.
- The backend should have started up properly.
