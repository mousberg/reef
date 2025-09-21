#!/usr/bin/env bash

# Exit on error
set -e

git submodule init
git submodule update

# Change to coral-server directory
cd coral-server

# Set config path and run gradlew
REGISTRY_FILE_PATH="../registry.toml" ./gradlew run
