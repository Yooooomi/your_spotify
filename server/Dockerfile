FROM node:16-alpine

WORKDIR /app

ENV MONGO_ENDPOINT=mongodb://mongo:27017/your_spotify

RUN apk add python3 gcc g++ make cmake
RUN npm install -g nodemon

COPY package.json /app/package.json
COPY yarn.lock /app/yarn.lock
COPY tsconfig.json /app/tsconfig.json
RUN sed -i 's@"extends": "../tsconfig.json",@@g' /app/tsconfig.json 

RUN yarn --frozen-lockfile

COPY src/ /app/src/
COPY scripts/ /app/scripts/

ENTRYPOINT [ "sh", "scripts/run/run.sh" ]