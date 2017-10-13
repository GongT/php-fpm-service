#!/bin/sh

set -x
set -e

pecl install "${@}"
docker-php-ext-enable "${@}"
