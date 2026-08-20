# Catalogue data service

The refresher gathers the filmography and provider catalogue, enriches movies through TMDB, and
publishes one versioned snapshot to Redis. Movie and provider data are staged under version-specific
keys before a Redis transaction switches the active-version pointer. A failed refresh therefore
leaves the previous version available to readers.

## Resilience policy

- Movie enrichment runs with five concurrent requests by default (`ENRICHMENT_CONCURRENCY`).
- Each request has a 10-second timeout and at most three attempts.
- HTTP 429 responses honor `Retry-After`. HTTP 5xx, timeouts, and transient network failures use
  exponential backoff beginning at 250 ms and capped at four seconds.
- A refresh is rejected when no movies are enriched or when failures exceed 10% of credits. Override
  the ratio from 0 through 1 with `MAX_ENRICHMENT_FAILURE_RATIO`.
- Rejected and failed publications do not change the active catalogue version.

The latest refresh summary is stored in Redis and exposed by `GET /filmography/refresh-status`. It
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

## Production schedule

Production uses `wmca-catalogue-refresh.timer` on the application host. It starts the data-service
container at midnight and noon UTC, with up to five minutes of randomized delay. The deployment
workflow installs the timer and executes one refresh immediately after the long-running Redis and API
services start.

The timer does not run an HTTP server. Systemd records the one-shot container exit status and sends
stdout and stderr to the journal. A host `flock` prevents duplicate timer/manual service invocations;
the Redis lease remains the authoritative cross-process guard.

```sh
systemctl status wmca-catalogue-refresh.timer
systemctl status wmca-catalogue-refresh.service
journalctl -u wmca-catalogue-refresh.service

# Trigger one production refresh and wait for its exit status.
sudo systemctl start wmca-catalogue-refresh.service
```
