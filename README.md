js-digitalbits-sdk is a Javascript library for communicating with a
[DigitalBits Frontier server](https://github.com/xdbfoundation/go/tree/master/services/frontier).
It is used for building DigitalBits apps either on Node.js or in the browser.

It provides:

- a networking layer API for Frontier endpoints.
- facilities for building and signing transactions, for communicating with a
  DigitalBits Frontier instance, and for submitting transactions or querying network
  history.

### digitalbits-sdk vs digitalbits-base

digitalbits-sdk is a high-level library that serves as client-side API for Frontier.
[digitalbits-base](https://github.com/xdbfoundation/js-digitalbits-base) is lower-level
library for creating DigitalBits primitive constructs via XDR helpers and wrappers.

**Most people will want digitalbits-sdk instead of digitalbits-base.** You should only
use digitalbits-base if you know what you're doing!

If you add `digitalbits-sdk` to a project, **do not add `digitalbits-base`!** Mis-matching
versions could cause weird, hard-to-find bugs. `digitalbits-sdk` automatically
installs `digitalbits-base` and exposes all of its exports in case you need them.

> **Important!** The Node.js version of the `digitalbits-base` (`digitalbits-sdk` dependency) package
> uses the [`sodium-native`](https://www.npmjs.com/package/sodium-native) package as
> an [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies). `sodium-native` is
> a low level binding to [libsodium](https://github.com/jedisct1/libsodium),
> (an implementation of [Ed25519](https://ed25519.cr.yp.to/) signatures).
> If installation of `sodium-native` fails, or it is unavailable, `digitalbits-base` (and `digitalbits-sdk`) will
> fallback to using the [`tweetnacl`](https://www.npmjs.com/package/tweetnacl) package implementation.
>
> If you are using `digitalbits-sdk`/`digitalbits-base` in a browser you can ignore
> this. However, for production backend deployments you should be
> using `sodium-native`. If `sodium-native` is successfully installed and working the
> `DigitalBitsSdk.FastSigning` variable will return `true`.

## Quick start

Using npm to include js-digitalbits-sdk in your own project:

```shell
npm install --save digitalbits-sdk
```

## Install

### To use as a module in a Node.js project

1. Install it using npm:

```shell
npm install --save digitalbits-sdk
```

2. require/import it in your JavaScript:

```js
var DigitalBitsSdk = require('digitalbits-sdk');
```

### To self host for use in the browser

1. Install it using [bower](http://bower.io):

```shell
bower install digitalbits-sdk
```

2. Include it in the browser:

```html
<script src="./bower_components/digitalbits-sdk/digitalbits-sdk.js"></script>
<script>
  console.log(DigitalBitsSdk);
</script>
```

### To develop and test js-digitalbits-sdk itself

1. Clone the repo:

```shell
git clone https://github.com/xdbfoundation/js-digitalbits-sdk.git
```

2. Install dependencies inside js-digitalbits-sdk folder:

```shell
cd js-digitalbits-sdk
npm install
```

3. Install Node 10.16.3

Because we support earlier versions of Node, please install and develop on Node
10.16.3 so you don't get surprised when your code works locally but breaks in CI.

Here's out to install `nvm` if you haven't: https://github.com/creationix/nvm

```shell
nvm install

# if you've never installed 10.16.3 before you'll want to re-install yarn
npm install -g yarn
```

If you work on several projects that use different Node versions, you might it
helpful to install this automatic version manager:
https://github.com/wbyoung/avn

4. Observe the project's code style

While you're making changes, make sure to run the linter-watcher to catch any
   linting errors (in addition to making sure your text editor supports ESLint)

```shell
node_modules/.bin/gulp watch
````

If you're working on a file not in `src`, limit your code to Node 6.16 ES! See
what's supported here: https://node.green/ (The reason is that our npm library
must support earlier versions of Node, so the tests need to run on those
versions.)

### How to use with React-Native

1. Add the following postinstall script:
```
yarn rn-nodeify --install url,events,https,http,util,stream,crypto,vm,buffer --hack --yarn
```
2. `yarn add -D rn-nodeify`
3. Uncomment `require('crypto')` on shim.js
4. `react-native link react-native-randombytes`
5. Create file `rn-cli.config.js`
```
module.exports = {
  resolver: {
    extraNodeModules: require("node-libs-react-native"),
  },
};
```
6. Add `import "./shim";` to the top of `index.js`
7. `yarn add digitalbits-sdk`

## Usage

For information on how to use js-digitalbits-sdk, take a look at the
[Developers site](https://developers.digitalbits.io/reference/js-digitalbits-sdk/docs/reference/readme).

There is also API Documentation
[here](https://developers.digitalbits.io/reference/).

## Testing

To run all tests:

```shell
gulp test
```

To run a specific set of tests:

```shell
gulp test:node
gulp test:browser
```

To generate and check the documentation site:

```shell
# install the `serve` command if you don't have it already
npm install -g serve

# generate the docs files
npm run docs

# get these files working in a browser
cd jsdoc && serve .

# you'll be able to browse the docs at http://localhost:5000
```

## Documentation

Documentation for this repo lives in
[Developers site](https://developers.digitalbits.io/reference/js-digitalbits-sdk/docs/reference/readme).

## Publishing to npm

```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```

A new version will be published to npm **and** Bower by Travis CI.

npm >=2.13.0 required. Read more about
[npm version](https://docs.npmjs.com/cli/version).

## License

js-digitalbits-sdk is licensed under an Apache-2.0 license. See the
[LICENSE](https://github.com/xdbfoundation/js-digitalbits-sdk/blob/master/LICENSE) file
for details.
