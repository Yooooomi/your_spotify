FROM node:alpine3.10

WORKDIR /app

ENV MONGO_ENDPOINT=mongodb://mongo:27017/your_spotify

RUN apk add python3 gcc g++ make cmake
RUN npm install -g nodemon

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install

COPY src/ /app/src/
COPY scripts/ /app/scripts/

ENTRYPOINT [ "sh", "scripts/run/run.sh" ]