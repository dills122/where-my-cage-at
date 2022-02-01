FROM ghcr.io/dills122/rushjs-base-img:edge

WORKDIR /tmp
COPY . .

# RUN sh ./git-temp.sh
# Setup & Deploy Frontend
# WORKDIR /tmp/temp
RUN rm -rf ./common/temp \
    && rush update --purge 
# Currently build is failing due to warning on bundle size
RUN rush build --to frontend 
RUN mkdir ./prod \
    && rush deploy --project frontend --target-folder ./prod
