# Where My Cage At (Nick Cage Fan Site)

Next time you plan a Netflix and chill, why not make it a Nick-casion? Find a place to stream, rent, or buy any Nick Cage's films.

## Getting Started

The primary local loop expects Node 22 and Rush. Install dependencies from the repository root:

```bash
rush update
```

## Running the Solution

Start Angular with the committed, deterministic catalogue fixture:

```sh
cd apps/frontend
rushx start
```

The frontend is available at `http://localhost:4200/`. It reads generated JSON and provider icons
from the same Angular origin; Redis and the API are not required for normal frontend development.

To replace the fixture with live JustWatch/TMDB data, set `TMDB_KEY` in
`apps/data-service/.env`, then publish directly into the frontend asset directory:

```sh
cd apps/data-service
rushx refresh:static ../frontend/src/assets/catalogue
```

The refresh stages and validates a complete snapshot before replacing the existing files. Do not
commit a locally refreshed production catalogue. The legacy Redis publisher and API remain in the
workspace during the staged migration, but are no longer part of the default local or hosted path.

The JustWatch contract can be checked without writing to Redis:

```sh
# apps/wtw
cd apps/wtw
rushx test:live
```

With Angular running, execute the local browser smoke test from another terminal:

```sh
cd apps/frontend
rushx cypress:run
```

To exercise Cloudflare's SPA routing locally, build and start Wrangler's asset preview:

```sh
cd apps/frontend
rushx build
rushx cloudflare:preview
```

## Deployment

Production runs on Cloudflare Workers Static Assets. OpenTofu owns the durable
zone, Worker identity, settings, and custom-domain attachments. Wrangler owns
versioned Angular/static-catalogue deployments to that identity.

The `Refresh and deploy Cloudflare` workflow runs manually for a reviewed full
commit SHA and, once enabled, at midnight and noon UTC. Each run:

1. verifies that the selected commit is an immutable ancestor of `master`;
2. generates and validates a fresh static catalogue;
3. builds Angular and performs a Wrangler dry-run;
4. deploys the assets, records the resulting deployment, and checks the hosted site.

Configure the GitHub `production` environment with `TMDB_KEY`,
`CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_ACCOUNT_ID`. Optionally set
`WMCA_PRODUCTION_ORIGIN` (defaults to `https://wheremycageat.com`). Scheduled
deployments are guarded by the repository variable `CLOUDFLARE_DEPLOY_ENABLED`;
set it to `true` only after the OpenTofu bootstrap and first manual deployment
have succeeded. Disable `run_hosted_smoke` for that bootstrap deployment if the
custom domain has not been attached yet.

See [`infrastructure/README.md`](infrastructure/README.md) for prerequisites,
credential-free validation, R2 remote-state bootstrap, planning, applying, and
the exact OpenTofu/CI ownership boundary.
