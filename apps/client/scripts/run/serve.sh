#!/bin/sh

# -s means that all 404's will be redirected to index.html, so that react can handle router
# -l tcp://[::]:3000 listens on all interfaces dual-stack (IPv6 + IPv4)
# build/ is the output of the package built at build-time

exec serve -c /app/apps/client/scripts/run/serve.json -s -l tcp://[::]:3000 /app/apps/client/build/
