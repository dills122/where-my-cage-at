#!/bin/bash

pushd ./apps/wtw
rushx build
popd
pushd ./apps/redis-sdk
rushx build
