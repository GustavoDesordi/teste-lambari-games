#!/bin/sh
set -eu
cd "$(dirname "$0")/backend"
exec node src/cli/index.js
