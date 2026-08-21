# Catalogue data service

The refresher gathers the filmography and provider catalogue and enriches movies through TMDB. Its
primary publisher now writes one static snapshot for the Angular/Cloudflare deployment. The legacy
Redis publisher remains available while the old API path is retired.

## Resilience policy

- Movie enrichment runs with five concurrent requests by default (`ENRICHMENT_CONCURRENCY`).
- Each request has a 10-second timeout and at most three attempts.
- HTTP 429 responses honor `Retry-After`. HTTP 5xx, timeouts, and transient network failures use
  exponential backoff beginning at 250 ms and capped at four seconds.
- A refresh is rejected when no movies are enriched or when failures exceed 10% of credits. Override
  the ratio from 0 through 1 with `MAX_ENRICHMENT_FAILURE_RATIO`.
- Rejected and failed publications do not change the active catalogue version.

For the legacy publisher, the latest refresh summary is stored in Redis and exposed by `GET /filmography/refresh-status`. It
includes the outcome, active and attempted versions, timestamps, duration, record counts, and failure
details. Logs use one JSON summary per refresh instead of per-movie messages.

## Running a refresh

For a local manual refresh, start Redis, configure `TMDB_KEY` in `.env`, and run:

```sh
cd apps/data-service
rushx refresh
```

The command performs one refresh and exits with a non-zero status on failure. A renewable Redis lease
prevents another manual or scheduled process from running at the same time. The production image has
the same one-shot behavior:

```sh
docker compose --profile jobs run --rm data-service
```

## Generating a static catalogue

The Cloudflare-oriented publisher reuses the same JustWatch/TMDB gathering, retry, concurrency, and
failure-threshold behavior, but does not connect to Redis. Configure `TMDB_KEY` in `.env`, then provide
an output directory as an argument:

```sh
cd apps/data-service
rushx refresh:static ./generated/catalogue
```

Alternatively, set `STATIC_CATALOGUE_OUTPUT_DIR` and run `rushx refresh:static` without an argument.
The local `generated/` directory is ignored by Git; CI should pass its artifact or frontend staging
directory explicitly.

Publication writes a complete staged directory before promoting it. If gathering, validation, file
writing, or pre-promotion checks fail, the existing output directory is left unchanged. A successful
output contains only the files below. For safety, an existing directory is replaced only when it
already contains a schema-v1 `catalogue-manifest.json`; use a dedicated output directory rather than
a general frontend assets directory.

- `filmography.json`: the complete `MovieRecord[]` snapshot.
- `service-providers.json`: the complete `ServiceProvider[]` snapshot.
- `catalogue-manifest.json`: schema version, catalogue version, generation timestamp, and an artifact
  entry containing the relative path, record count, and SHA-256 of the exact bytes for each data file.

The manifest contract is:

```json
{
  "schemaVersion": 1,
  "catalogueVersion": "2026-08-20T12:00:00.000Z-<uuid>",
  "generatedAt": "2026-08-20T12:00:42.000Z",
  "artifacts": [
    {
      "path": "filmography.json",
      "recordCount": 42,
      "sha256": "<64 lowercase hexadecimal characters>"
    },
    {
      "path": "service-providers.json",
      "recordCount": 18,
      "sha256": "<64 lowercase hexadecimal characters>"
    }
  ]
}
```

## Production schedule

`.github/workflows/deploy-cloudflare.action.yml` generates a fresh snapshot and deploys it with the
Angular assets at midnight and noon UTC. The schedule is inert unless the repository variable
`CLOUDFLARE_DEPLOY_ENABLED` is `true`; manual releases remain available for an explicit full commit
SHA. GitHub's `production` environment supplies `TMDB_KEY` and the Cloudflare credentials.

The workflow serializes production releases, performs a Wrangler dry-run, records the deployment and
catalogue versions, and checks the hosted manifest. A failed refresh or build never changes the
currently deployed snapshot.
