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

The environment variables are the same as in the docker-compose for server, with an additional `PORT` variable you can set.

### Systemd user unit

- Create a systemd unit file in your home directory at `.config/systemd/user/` (create the folders if they don't exist) and name it like `your_spotify.service` or however you want.  
  
File content should be something like (seperate one for MongoDB if needed):
```
[Unit]
Description=Your Spotify Backend
Wants=network-online.target mongodb.service
After=syslog.target network.target nss-lookup.target network-online.target

[Service]
EnvironmentFile=/home/users/samip537/sites/applications/spotify/your_spotify/server/.env
ExecStart=/home/users/samip537/.nvm/versions/node/v16.14.0/bin/node lib/bin/www
StandardOutput=journal
Restart=on-failure
WorkingDirectory=/home/users/samip537/sites/applications/spotify/your_spotify/server

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
ExecStart=/home/users/samip537/filesystem/bin/mongod --dbpath /home/users/samip537/filesystem/var/lib/mongo --logpath /home/users/samip537/filesystem/var/log/mongodb/mongod.log --fork --bind_ip 127.0.0.1 --port 40097 
StandardOutput=journal
Restart=on-failure
WorkingDirectory=/home/users/samip537/filesystem/

[Install]
WantedBy=multi-user.target
```

- Enable the services and start them with  `systemctl --user --now enable mongodb` `systemctl --user --now enable your_spotify`.
- The backend should have started up properly.

## Hosting client

- Go to the client directory and `yarn` in it
- Run `yarn build`
- In the build directory produced, copy `variables.js` into `variables-final.js` and replace the endpoint with the API_ENDPOINT, that is the endpoint of your backend
- Host the static website in the build directory the way you want, I personally use `serve`

> Note that you need to redirect all 404 errors to index.html, serve does this by default and there's a .htaccess file for Apache2.
