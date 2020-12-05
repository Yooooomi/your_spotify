#!/bin/sh

echo "ENVIRONMENT is '$ENVIRONMENT'"

if [[ "$ENVIRONMENT" != "DEV" ]]
then
    yarn build
fi
