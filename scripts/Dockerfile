FROM ghcr.io/dills122/rushjs-base-img:edge

WORKDIR /tmp
COPY ../ .

# Setup & Deploy Frontend
RUN rush update && rush build --to frontend \
    && rush deploy --project frontend --target-folder ./prod 