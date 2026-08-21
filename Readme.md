# Where My Cage At (Nick Cage Fan Site)

Next time you plan a Netflix and chill, why not make it a Nick-casion? Find a place to stream, rent, or buy any Nick Cage's films.

## Getting Started

The local stack expects Node 22, Docker, and Rush. Install dependencies from the repository root:

```bash
rush update
```

## Running the Solution

Start Redis Stack. The container includes RedisJSON, persists its data in a named Docker volume, and exposes Redis on port `6379` by default.

```sh
docker compose up -d redis
docker compose ps
```

Set `TMDB_KEY` in `apps/data-service/.env` to your [TMDB API key](https://developer.themoviedb.org/docs/getting-started), then build the workspace and populate local Redis. The refresh reads JustWatch and TMDB, then replaces the local movie and provider catalogs.

```sh
rush build

# apps/data-service
cd apps/data-service
rushx refresh
```

The data service is a one-shot job: it exits successfully after publishing a complete catalogue and
returns a non-zero status when the refresh fails or another refresh owns the Redis lease. Production
schedules the same container twice daily with a systemd timer; operational commands are documented in
`apps/data-service/README.md`.

The JustWatch contract can be checked without writing to Redis:

```sh
# apps/wtw
cd apps/wtw
rushx test:live
```

Start the API and frontend in separate terminals:

```sh
# apps/api
cd apps/api
rushx start:dev
```

```sh
# apps/frontend
cd apps/frontend
rushx start
```

The frontend is available at `http://localhost:4200/` and uses the API at `http://localhost:3000/` in Angular development mode.

With both servers running, execute the local browser smoke test from another terminal:

```sh
cd apps/frontend
rushx cypress:run
```

Stop the local infrastructure without deleting its Redis data:

```sh
docker compose down
```

## Deployment

Production is being rebuilt on Cloudflare Workers Static Assets. OpenTofu owns
the durable zone, Worker identity, settings, and custom-domain attachments;
the application deployment pipeline will build Angular and deploy versioned
static assets with Wrangler.

See [`infrastructure/README.md`](infrastructure/README.md) for prerequisites,
credential-free validation, R2 remote-state bootstrap, planning, applying, and
the exact OpenTofu/CI ownership boundary.
