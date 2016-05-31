#!/bin/bash

from_file="/icestat/$1"
to_file="/icestat/$2"

if [ -f "$to_file" ]
then
  echo "ERROR: $to_file -– already exist"
else
  cat $from_file > $to_file
  chmod 0777 $to_file;
  echo 'rename file:' $from_file 'to' $to_file
fi

