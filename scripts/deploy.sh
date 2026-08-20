#!/usr/bin/env bash

set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly repo_dir

sudo mkdir -p /var/www/prod
pushd "${repo_dir}"

if [[ "${1:-false}" == 'true' ]]; then
	git pull --ff-only
fi

docker build -t ang-node-builder:latest -f AngBuildDockerfile .
sudo docker create -ti --name dummy ang-node-builder:latest bash
sudo docker cp dummy:/tmp/apps/frontend/dist/frontend/. /var/www/prod
sudo docker rm -f dummy

# Build both long-running services and the one-shot refresh image. Only Redis and the API stay up.
sudo docker compose --profile jobs rm --stop --force data-service
sudo docker compose --profile jobs build api data-service
sudo docker compose up -d redis api

sudo ./scripts/install-catalogue-refresh-timer.sh "${repo_dir}"
sudo systemctl start wmca-catalogue-refresh.service
sudo systemctl restart nginx

popd
