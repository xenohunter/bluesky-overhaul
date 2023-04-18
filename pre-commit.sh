#!/bin/bash

# TODO : move this to the webpack pipeline
# Check there is no TODO! in the code
if grep -r "TODO!" ./src; then
  echo "TODO! found in code"
  exit 1
fi

# Build & make packages
npm run build
