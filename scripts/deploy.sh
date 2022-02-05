#!/bin/bash

# Should only be run in a droplet

sudo mkdir -p /var/www/prod

pushd ~/app-src/

# If true do a fresh pull
if [ "$1" = true ]; then
    git pull
fi

# Build and deploy the angular frontend
docker build -t ang-node-builder:latest -f AngBuildDockerfile .

sudo docker create -ti --name dummy ang-node-builder:latest bash
# This one can be used for local testing
# docker cp dummy:/tmp/apps/frontend/dist/frontend/. /c/Users/dss25/repos/where-my-cage-at/tmp
sudo docker cp dummy:/tmp/apps/frontend/dist/frontend/. /var/www/prod
sudo docker rm -f dummy

export API_PORT=3000
export CRON_PORT=3001
export REDIS_PORT=6379

# Get all of the docker services running
sudo docker-compose up -d --build

sudo systemctl restart nginx

popd
