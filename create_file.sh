#!/bin/bash

file="/icestat/$1"

if [ -f "$file" ]
then
  echo "ERROR: $file -– already exist"
else
  touch $file;
  chmod 0777 $file;
  echo 'create file:' $file
fi

