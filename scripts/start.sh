#!/bin/sh

update-resolve

exec php-fpm -F -R -O
