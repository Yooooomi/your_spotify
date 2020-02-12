FROM node:alpine3.10

WORKDIR /app

RUN apk add python3 gcc g++ make cmake
RUN npm install -g nodemon

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install

COPY src/ /app/src/

ENTRYPOINT [ "yarn", "dev" ]