#!/usr/bin/env bash

source "./scripts/utils.sh"

"./scripts/build/build.sh"

dps "Bringing up webpack dev server..."
"./scripts/serve/serve.js"
