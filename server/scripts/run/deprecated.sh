#!/bin/sh

if [ "$CORS" == "all" ]
then
  echo "Setting CORS to 'all' is not needed anymore, omitting it is the new way of authorizing every origin."
fi
