FROM ghcr.io/dills122/rushjs-base-img:edge
WORKDIR /tmp
COPY . .

RUN adduser -S app
RUN rm -rf ./common/temp \
    && rush purge \
    && rush install -f api \
    && rush build --to api
RUN mkdir ./prod \
    && rush deploy --project api --target-folder ./prod \
    && cp ./.env ./prod/apps/api/ \
    && cp -avr ./data/icons ./prod/apps/api
RUN npm i -g @nestjs/cli
WORKDIR /tmp/prod/apps/api
RUN chown -R app /tmp/prod
USER app

CMD ["pm2-runtime", "start", "processes.json", "--env", "production"]
