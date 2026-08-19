#!/usr/bin/env bash

set -euo pipefail

readonly image="redis/redis-stack-server:7.4.0-v8"
readonly container="redis-sdk-integration-$$"

cleanup() {
	docker rm --force "${container}" >/dev/null 2>&1 || true
}
trap cleanup EXIT

docker run --detach --rm --name "${container}" --publish 127.0.0.1::6379 "${image}" >/dev/null

for _ in {1..50}; do
	if docker exec "${container}" redis-cli ping >/dev/null 2>&1; then
		break
	fi
	sleep 0.1
done

if ! docker exec "${container}" redis-cli ping >/dev/null 2>&1; then
	echo 'The isolated Redis test instance did not become ready.' >&2
	exit 1
fi

port_mapping="$(docker port "${container}" 6379/tcp)"
export REDIS_TEST_PORT="${port_mapping##*:}"
if [[ ! "${REDIS_TEST_PORT}" =~ ^[0-9]+$ ]]; then
	echo 'Unable to determine the isolated Redis test port.' >&2
	exit 1
fi

TS_NODE_PREFER_TS_EXTS=true node --test --require ts-node/register tests/client.integration.test.ts
