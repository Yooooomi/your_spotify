FROM node:16-alpine

WORKDIR /app

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
COPY tsconfig.json /app/tsconfig.json

RUN yarn --frozen-lockfile --dev

COPY src src
COPY public public

CMD [ "yarn", "run", "start" ]
