#!/bin/bash

# Should only be run in a droplet

mkdir -p /var/www/prod

# Copy Nginx config files
cp ~/app-src/.docker/nginx/conf.d/* /etc/nginx/conf.d/

pushd ~/app-src/

# Setup & Deploy Frontend
rush update
rush build --to frontend

rush deploy --project frontend
cp ./common/deploy/apps/frontend/dist/frontend/* /var/www/prod

# Get all of the docker services running
docker compose up -d

# Might be dup commands
sudo systemctl restart nginx

nginx -t && nginx -s reload

popd
