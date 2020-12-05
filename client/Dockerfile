FROM node:alpine3.10

WORKDIR /app

RUN apk add python3 gcc g++ make cmake
RUN npm install -g nodemon serve

COPY scripts/ scripts/
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

RUN npm install

COPY src/ /app/src/
COPY public/ /app/public/

ARG ENVIRONMENT
ENV ENVIRONMENT ${ENVIRONMENT:-PRODUCTION}

RUN sh scripts/build/*.sh

ENTRYPOINT [ "sh", "/app/scripts/run/run.sh" ]
