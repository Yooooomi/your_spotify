FROM node:16-alpine

WORKDIR /app

RUN apk add python3 gcc g++ make cmake
RUN npm install -g nodemon serve

COPY scripts/ scripts/
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
COPY tsconfig.json /app/tsconfig.json

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

RUN yarn --frozen-lockfile --dev

COPY src/ /app/src/
COPY public/ /app/public/

RUN sh scripts/build/*.sh

ENTRYPOINT [ "sh", "/app/scripts/run/run.sh" ]
