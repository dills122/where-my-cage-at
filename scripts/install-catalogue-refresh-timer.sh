#!/usr/bin/env bash

set -euo pipefail

if [[ "$#" -ne 1 && "$#" -ne 3 ]]; then
	echo 'Usage: install-catalogue-refresh-timer.sh APP_DIR [REGISTRY_HOST IMAGE_TAG]' >&2
	exit 64
fi

app_dir="$(cd "$1" && pwd)"
readonly app_dir
readonly registry_host="${2:-}"
readonly image_tag="${3:-}"

for value in "${app_dir}" "${registry_host}" "${image_tag}"; do
	if [[ "${value}" =~ [[:space:]] ]]; then
		echo 'Scheduler paths and image identifiers cannot contain whitespace.' >&2
		exit 64
	fi
done

install -d -m 0755 /etc/wmca
install -m 0755 scripts/run-catalogue-refresh.sh /usr/local/bin/wmca-catalogue-refresh
install -m 0644 deployment/systemd/wmca-catalogue-refresh.service /etc/systemd/system/
install -m 0644 deployment/systemd/wmca-catalogue-refresh.timer /etc/systemd/system/

{
	printf 'WMCA_APP_DIR=%s\n' "${app_dir}"
	if [[ -n "${registry_host}" ]]; then
		printf 'REGISTRY_HOST=%s\n' "${registry_host}"
		printf 'GITHUB_SHA_SHORT=%s\n' "${image_tag}"
	fi
} > /etc/wmca/catalogue-refresh.env
chmod 0600 /etc/wmca/catalogue-refresh.env

systemctl daemon-reload
systemctl enable --now wmca-catalogue-refresh.timer
