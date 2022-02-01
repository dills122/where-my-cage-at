#!/bin/bash

# Should only be run in a droplet

sudo mkdir -p /var/www/prod

# Copy Nginx config files
sudo cp ~/app-src/.docker/nginx/conf.d/* /etc/nginx/conf.d/

pushd ~/app-src/

# Build and deploy the angular frontend
docker build -t ang-node-builder:latest .

docker create -ti --name dummy ang-node-builder:latest bash
# This one can be used for local testing
# docker cp dummy:/tmp/apps/frontend/dist/frontend/. /c/Users/dss25/repos/where-my-cage-at/tmp
docker cp dummy:/tmp/apps/frontend/dist/frontend/. /var/www/prod
docker rm -f dummy

# Get all of the docker services running
docker compose up -d

# Might be dup commands
sudo systemctl restart nginx

sudo nginx -t && sudo nginx -s reload

popd
