#!/bin/bash

git clone https://github.com/dills122/where-my-cage-at.git app-src
pushd app-src
git pull
git checkout deployment-setup
popd
