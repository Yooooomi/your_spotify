FROM node:16-alpine

WORKDIR /app

RUN apk add python3 gcc g++ make cmake
RUN npm install -g nodemon serve

COPY scripts/ scripts/
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY tsconfig.json tsconfig.json
COPY .prettierrc .prettierrc
COPY .eslintrc.js .eslintrc.js
RUN sed -i 's@"extends": "../tsconfig.json",@@g' tsconfig.json 

ARG NODE_ENV
ENV NODE_ENV ${NODE_ENV:-production}

RUN yarn --frozen-lockfile --dev

COPY src/ src/
COPY public/ public/

RUN sh scripts/build/*.sh

ENTRYPOINT [ "sh", "/app/scripts/run/run.sh" ]
