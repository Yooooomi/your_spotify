#!/bin/sh

if [[ "$ENVIRONMENT" == "DEV" ]]
then
    # Modify the dev file
    VAR_PATH="/app/public/variables-final.js"
else
    # Modify the built file
    VAR_PATH="/app/build/variables-final.js"
fi

cp /app/build/variables.js $VAR_PATH

if [ ! -z "$API_ENDPOINT" ]
then
    echo "Setting API Endpoint to '$API_ENDPOINT'"
    sed -i "s;__API_ENDPOINT__;$API_ENDPOINT;g" "$VAR_PATH"
else
    echo "API_ENDPOINT is not defined, web app won't work"
    exit 1
fi