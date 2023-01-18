#!/bin/sh

if [[ "$NODE_ENV" == "development" ]]
then
    # Modify the dev file
    VAR_PATH="/app/public"
else
    # Modify the built file
    VAR_PATH="/app/build"
fi

cp "$VAR_PATH/variables-template.js" "$VAR_PATH/variables.js"
cp "$VAR_PATH/index-template.html" "$VAR_PATH/index.html"

if [ ! -z "$API_ENDPOINT" ]
then
    echo "Setting API Endpoint to '$API_ENDPOINT'"
    sed -i "s;__API_ENDPOINT__;$API_ENDPOINT;g" "$VAR_PATH/variables.js"
    sed -i "s;__API_ENDPOINT__;$API_ENDPOINT;g" "$VAR_PATH/index.html"
else
    echo "API_ENDPOINT is not defined, web app won't work"
    exit 1
fi
