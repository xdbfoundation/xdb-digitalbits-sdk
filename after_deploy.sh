npm install jsdoc
git clone -b gh-pages "git@github.com:DigitalBitsOrg/js-digitalbits-sdk.git" jsdoc

if [ ! -d "jsdoc" ]; then
  echo "Error cloning"
  exit 1
fi

jsdoc -c .jsdoc.json --verbose
cd jsdoc
git add .
git commit -m $TRAVIS_TAG
git push origin gh-pages
