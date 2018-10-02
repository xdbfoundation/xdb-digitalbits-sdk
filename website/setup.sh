#!/bin/bash

cd ../../
if [ "$TRAVIS" ]; then
  git clone "https://git@github.com/digitalbitsorg/js-digitalbits-lib.git" js-digitalbits-lib-gh-pages
else
  git clone git@github.com:digitalbits/js-digitalbits-lib.git js-digitalbits-lib-gh-pages
fi
cd js-digitalbits-lib-gh-pages
git checkout origin/gh-pages
git checkout -b gh-pages
git branch --set-upstream-to=origin/gh-pages
cd ../js-digitalbits-lib/website
