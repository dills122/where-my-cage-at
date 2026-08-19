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
