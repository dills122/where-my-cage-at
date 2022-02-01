FROM ghcr.io/dills122/rushjs-base-img:edge

WORKDIR /tmp
COPY . .

RUN sh ./git-temp.sh
# Setup & Deploy Frontend
WORKDIR /tmp/temp
RUN rush update && rush build --to frontend \
    && rush deploy --project frontend --target-folder ./prod 