#!/bin/sh

set -x
set -e

update-alpine
update-resolve

apk update
docker-php-source extract
