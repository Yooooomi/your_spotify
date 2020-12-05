#!/bin/sh

# -s means that all 404's will be redirected to index.html, so that react can handle router
# -l 0.0.0.0 means that it's hosted on all the interfaces
# build/ is the output of the package built at build-time

serve -s -l tcp://0.0.0.0:3000 build/