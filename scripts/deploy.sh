#!/bin/bash

# Should only be run in a droplet

sudo mkdir -p /var/www/prod

# Copy Nginx config files
cp ~/app-src/.docker/nginx/conf.d/* /etc/nginx/conf.d/

pushd ~/app-src/

docker run -d -v /var/www/prod:/tmp/prod .

# Get all of the docker services running
docker compose up -d

# Might be dup commands
sudo systemctl restart nginx

sudo nginx -t && sudo nginx -s reload

popd
