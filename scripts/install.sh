#!/bin/sh

PLUGIN=$1
CONFIG=$2
DEPS=$3

set -x
set -e

if [ -n "${CONFIG}" ]; then
	eval apk add ${DEPS}
fi

if [ -n "${CONFIG}" ]; then
	docker-php-ext-configure ${PLUGIN} ${CONFIG}
fi

docker-php-ext-install -j2 ${PLUGIN}

if [ -n "${CONFIG}" ]; then
	eval apk del --purge ${DEPS}
fi
