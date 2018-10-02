#!/bin/bash

set -e

cd ../../js-digitalbits-lib-gh-pages
git checkout -- .
git clean -dfx
git fetch
git rebase
rm -Rf *
cd ../js-digitalbits-lib/website
npm run-script docs
cp -R docs/* ../../js-digitalbits-lib-gh-pages/
rm -Rf docs/
cd ../../js-digitalbits-lib-gh-pages
git add --all
git commit -m "update website"
git push
cd ../js-digitalbits-lib/website