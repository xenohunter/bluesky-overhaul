#!/bin/bash

# Check there is no TODO! in the code
if grep -r "TODO!" ./src; then
  echo "TODO! found in code"
  exit 1
fi

# Check if jq is installed
if ! command -v jq &> /dev/null
then
    echo "jq could not be found"
    exit 1
fi

# Check if versions match in manifest.json and package.json
MANIFEST_VERSION=$(jq -r .version manifest.json)
PACKAGE_VERSION=$(jq -r .version package.json)
if [ "$MANIFEST_VERSION" != "$PACKAGE_VERSION" ]; then
  echo "Version in manifest.json ($MANIFEST_VERSION) does not match package.json ($PACKAGE_VERSION)"
  exit 1
fi

# Run ESLint
npx eslint ./src

# Build & pack
npm run build
npm run pack
