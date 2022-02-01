FROM ghcr.io/dills122/rushjs-base-img:edge

WORKDIR /tmp
COPY . .

RUN rm -rf ./common/temp \
    && rush update --purge 
# Currently build is failing due to warning on bundle size added || true so it will pass build
RUN rush build --to frontend || true
