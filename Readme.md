# Where My Cage At (Nick Cage Fan Site)

Next time you plan a Netflix and chill, why not make it a Nick-casion? Find a place to stream, rent, or buy any Nick Cage's films.

## Getting Started

update and install dependencies

```bash
rush update
```

## Running the Solution

First you'll need to setup your ENV file based off the `.env.example` file in the root dir.

Next you'll need to create a `config.secret.ts` in `apps/data-service`. You'll need to setup an account at [tmdb](https://developers.themoviedb.org/3/getting-started/introduction) for an api-key.

Next you'll need to get a `redis reJSON` container running.

```bash
docker compose run redis-base
```

Build the dependency libraries (you can also run `rushx watch` on each to rebuild on change)

```bash
# apps/wtw
rushx build
# apps/redis-sdk
rushx build
```

After that you'll need to backfill all of the data needed for the app.

```bash
# apps/data-service
npx ts-node ./refresh-runner.ts
```

Finally, you can start up the frontend and api

```bash
# apps/api
rushx start:dev
```

```bash
# apps/frontend
rushx start
```

The frontend will be available at `http://localhost:4200/`