

VAR_PATH="/app/public/variables-final.js"

cp /app/public/variables.js $VAR_PATH

if [ ! -z "$API_ENDPOINT" ]
then
    sed -i "s;__API_ENDPOINT__;$API_ENDPOINT;g" "$VAR_PATH"
else
    echo "API_ENDPOINT is not defined, web app won't work"
    exit 1
fi