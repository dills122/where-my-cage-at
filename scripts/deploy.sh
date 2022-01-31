#!/bin/bash

# Copy Nginx config files
cp ~/app-src/.docker/nginx/conf.d/* /etc/nginx/conf.d/

# Setup & Deploy Frontend
rush update
rush build --to frontend
mkdir /var/www/prod
rush deploy --project frontend --target-folder /var/www/prod

# Get all of the docker services running
docker compose up -d

sudo systemctl restart nginx
