#!/usr/bin/env bash

set -euo pipefail

: "${WMCA_APP_DIR:?WMCA_APP_DIR must point to the deployed repository}"

if [[ -n "${REGISTRY_HOST:-}" && -z "${GITHUB_SHA_SHORT:-}" ]] || \
	[[ -z "${REGISTRY_HOST:-}" && -n "${GITHUB_SHA_SHORT:-}" ]]; then
	echo 'REGISTRY_HOST and GITHUB_SHA_SHORT must be configured together.' >&2
	exit 64
fi

cd "${WMCA_APP_DIR}"

compose_args=(--profile jobs -f docker-compose.yml)
if [[ -n "${REGISTRY_HOST:-}" ]]; then
	compose_args+=(-f docker-compose.prod.yml)
fi

exec flock --nonblock /run/lock/wmca-catalogue-refresh.lock \
	docker compose "${compose_args[@]}" \
		run --rm --no-deps data-service
