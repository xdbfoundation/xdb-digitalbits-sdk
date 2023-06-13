@digitalbits-blockchain/xdb-digitalbits-sdk is a Javascript library for communicating with a
[DigitalBits Frontier server](https://github.com/xdbfoundation/go/tree/master/services/frontier).
It is used for building DigitalBits apps either on Node.js or in the browser.

It provides:

- a networking layer API for Frontier endpoints.
- facilities for building and signing transactions, for communicating with a
  DigitalBits Frontier instance, and for submitting transactions or querying network
  history.

### @digitalbits-blockchain/xdb-digitalbits-sdk vs @digitalbits-blockchain/xdb-digitalbits-base

@digitalbits-blockchain/xdb-digitalbits-sdk is a high-level library that serves as client-side API for Frontier.
[@digitalbits-blockchain/xdb-digitalbits-base](https://github.com/xdbfoundation/xdb-digitalbits-base) is lower-level
library for creating DigitalBits primitive constructs via XDR helpers and wrappers.

**Most people will want @digitalbits-blockchain/xdb-digitalbits-sdk instead of @digitalbits-blockchain/xdb-digitalbits-base.** You should only
use @digitalbits-blockchain/xdb-digitalbits-base if you know what you're doing!

If you add `@digitalbits-blockchain/xdb-digitalbits-sdk` to a project, **do not add `@digitalbits-blockchain/xdb-digitalbits-base`!** Mis-matching
versions could cause weird, hard-to-find bugs. `@digitalbits-blockchain/xdb-digitalbits-sdk` automatically
installs `@digitalbits-blockchain/xdb-digitalbits-base` and exposes all of its exports in case you need them.

> **Important!** The Node.js version of the `@digitalbits-blockchain/xdb-digitalbits-base` (`@digitalbits-blockchain/xdb-digitalbits-sdk` dependency) package
> uses the [`sodium-native`](https://www.npmjs.com/package/sodium-native) package as
> an [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies). `sodium-native` is
> a low level binding to [libsodium](https://github.com/jedisct1/libsodium),
> (an implementation of [Ed25519](https://ed25519.cr.yp.to/) signatures).
> If installation of `sodium-native` fails, or it is unavailable, `@digitalbits-blockchain/xdb-digitalbits-base` (and `@digitalbits-blockchain/xdb-digitalbits-sdk`) will
> fallback to using the [`tweetnacl`](https://www.npmjs.com/package/tweetnacl) package implementation.
>
> If you are using `@digitalbits-blockchain/xdb-digitalbits-sdk`/`@digitalbits-blockchain/xdb-digitalbits-base` in a browser you can ignore
> this. However, for production backend deployments you should be
> using `sodium-native`. If `sodium-native` is successfully installed and working the
> `DigitalBitsSdk.FastSigning` variable will return `true`.

## Quick start

Using npm to include @digitalbits-blockchain/xdb-digitalbits-sdk in your own project:

```shell
npm install --save @digitalbits-blockchain/@digitalbits-blockchain/xdb-digitalbits-sdk
```

## Install

### To use as a module in a Node.js project

1. Install it using npm:

```shell
npm install --save @digitalbits-blockchain/xdb-digitalbits-sdk
```

2. require/import it in your JavaScript:

```js
var DigitalBitsSdk = require('@digitalbits-blockchain/xdb-digitalbits-sdk');
```
### To develop and test @digitalbits-blockchain/xdb-digitalbits-sdk itself

1. Clone the repo:

```shell
git clone https://github.com/xdbfoundation/xdb-digitalbits-sdk.git
```

2. Install dependencies inside xdb-digitalbits-sdk folder:

```shell
cd xdb-digitalbits-sdk
npm install
```

3. Install Node 14

Because we support the latest maintenance version of Node, please install and develop on Node 14 so you don't get surprised when your code works locally but breaks in CI.

Here's how to install `nvm` if you haven't: https://github.com/creationix/nvm

```shell
nvm install

# if you've never installed 14 before you'll want to re-install yarn
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
7. `yarn add @digitalbits-blockchain/xdb-digitalbits-sdk`

There is also a [sample](https://github.com/fnando/rn-digitalbits-sdk-sample) that you can follow.

#### Using in an Expo managed workflow

1. Add the following postinstall script:
```
yarn rn-nodeify --install process,url,events,https,http,util,stream,crypto,vm,buffer --hack --yarn
```
2. `yarn add -D rn-nodeify`
3. Add `import "./shim";` to the your app's entry point (by default `./App.js`)
4. `yarn add @digitalbits-blockchain/xdb-digitalbits-sdk`
5. `expo install expo-random`

At this point, the digitalbits SDK will work, except that `DigitalBitsSdk.Keypair.random()` will throw an error. So to work around this you can create your own method to generate a random keypair like this:

```javascript
import * as Random from 'expo-random';
import DigitalBitsSdk from '@digitalbits-blockchain/xdb-digitalbits-sdk';

const generateRandomKeypair = () => {
  const randomBytes = Random.getRandomBytes(32);

  return DigitalBitsSdk.Keypair.fromRawEd25519Seed(Buffer.from(randomBytes));
};
```

## Usage

For information on how to use @digitalbits-blockchain/xdb-digitalbits-sdk, take a look at [the
documentation](https://xdbfoundation.github.io/xdb-digitalbits-sdk/), or [the
examples](https://github.com/xdbfoundation/xdb-digitalbits-sdk/tree/master/docs/reference).

There is also Frontier REST API Documentation
[here](https://developers.digitalbits.io/frontier/reference/index.html).

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
[Developers site](https://github.com/xdbfoundation/xdb-digitalbits-sdk/blob/master/docs/reference/readme.md).

## Contributing

For information on how to contribute, please refer to our
[contribution guide](https://github.com/xdbfoundation/xdb-digitalbits-sdk/blob/master/CONTRIBUTING.md).

## Publishing to npm

```
npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```

A new version will be published to npm **and** Bower by GitHub actions.

npm >= 2.13.0 required. Read more about
[npm version](https://docs.npmjs.com/cli/version).

## License

@digitalbits-blockchain/xdb-digitalbits-sdk is licensed under an Apache-2.0 license. See the
[LICENSE](https://github.com/xdbfoundation/xdb-digitalbits-sdk/blob/master/LICENSE) file
for details.
