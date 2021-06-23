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


## Install

1. Install and create link to the [js-digitalbits-base](https://github.com/xdbfoundation/js-digitalbits-base)

```shell
git clone https://github.com/xdbfoundation/js-digitalbits-base.git
cd js-digitalbits-base
bundle install
yarn
yarn gulp
yarn link
cd ..
```

2. Clone repository and link in [js-digitalbits-base]

```shell
git clone https://github.com/xdbfoundation/js-digitalbits-sdk.git
cd js-digitalbits-sdk
yarn link digitalbits-base
yarn
yarn gulp build
```

3. Create link to the [js-digitalbits-sdk]

```shell
yarn link
```

4. Add lib to your project:

```shell
yarn link digitalbits-sdk
```

5. require/import it in your JavaScript:

```js
var DigitalBitsSdk = require('digitalbits-sdk');
```

## Usage

For information on how to use js-digitalbits-sdk, take a look at the
[docs](./docs/reference/readme.md).

There is also API Documentation
[here](https://github.com/xdbfoundation/go/tree/master/services/frontier/internal/docs/reference).

## Testing
Build before testing:

```shell
yarn gulp build
```

To run all tests:

```shell
yarn gulp test
```

To run a specific set of tests:

```shell
yarn gulp test:unit
yarn gulp test:browser
```

To generate and check the documentation site:

```shell
# install the `serve` command if you don't have it already
yarn global add serve

# generate the docs files
yarn docs

# get these files working in a browser
serve jsdocs/

# you'll be able to browse the docs at http://localhost:5000
```

## Documentation

Documentation for this repo lives in
[docs](./docs/reference/readme).


## License

js-digitalbits-sdk is licensed under an Apache-2.0 license. See the
[LICENSE](https://github.com/xdbfoundation/js-digitalbits-sdk/blob/master/LICENSE) file
for details.
