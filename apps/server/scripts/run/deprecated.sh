#!/bin/sh

if [ "$CORS" == "all" ]
then
  echo "Setting CORS to 'all' is not authorized anymore. To allow all sources, please specify CORS=i-want-a-security-vulnerability-and-want-to-allow-all-origins"
  exit 1
fi
