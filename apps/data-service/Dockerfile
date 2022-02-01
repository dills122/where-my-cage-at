FROM ghcr.io/dills122/rushjs-base-img:edge
WORKDIR /tmp
COPY . .

RUN adduser -S app
RUN rm -rf ./common/temp \
    && rush purge \
    && rush install -f data-service \
    && rush build --to data-service
RUN mkdir ./prod \
    && rush deploy --project data-service --target-folder ./prod \
    && cp ./.env ./prod/apps/data-service
WORKDIR /tmp/prod/apps/data-service
RUN chown -R app /tmp/prod
USER app

CMD ["pm2-runtime", "start", "processes.json", "--env", "production"]
