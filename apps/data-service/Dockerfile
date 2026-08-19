ARG NODE_IMAGE=node:22.22.1-bookworm-slim@sha256:4f77a690f2f8946ab16fe1e791a3ac0667ae1c3575c3e4d0d4589e9ed5bfaf3d

FROM ${NODE_IMAGE} AS builder

ENV CI=1
WORKDIR /workspace

COPY . .

RUN node common/scripts/install-run-rush.js install --to data-service --purge \
	&& node common/scripts/install-run-rush.js build --to data-service \
	&& node common/scripts/install-run-rush.js deploy \
		--project data-service \
		--target-folder /opt/deploy

FROM ${NODE_IMAGE} AS runtime

ENV CRON_PORT=3001 \
	NODE_ENV=prod \
	REDIS_HOST=redis \
	REDIS_PORT=6379

WORKDIR /app/apps/data-service

COPY --from=builder --chown=node:node /opt/deploy /app

USER node

EXPOSE 3001

CMD ["node", "cron-runner.js"]
