FROM node:16-alpine

WORKDIR /app

RUN apk add python3 gcc g++ make cmake
RUN npm install -g nodemon

COPY tsconfig.json /app/tsconfig.json
COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock

RUN yarn --frozen-lockfile

COPY src/ /app/src/
COPY scripts/ /app/scripts/

ENTRYPOINT [ "sh", "scripts/run/run_dev.sh" ]