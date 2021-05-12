# js-digitalbits-sdk

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

If you add digitalbits-sdk to a project, **do not add digitalbits-base!** Mis-matching
versions could cause weird, hard-to-find bugs. digitalbits-sdk automatically
installs digitalbits-base and exposes all of its exports in case you need them.

> **Warning!** Node version of `digitalbits-base` (`digitalbits-sdk` dependency) package
> is using [`ed25519`](https://www.npmjs.com/package/ed25519) package, a native
> implementation of [Ed25519](https://ed25519.cr.yp.to/) in Node.js, as an
> [optional dependency](https://docs.npmjs.com/files/package.json#optionaldependencies).
> This means that if for any reason installation of this package fails,
> `digitalbits-base` (and `digitalbits-sdk`) will fallback to the much slower
> implementation contained in
> [`tweetnacl`](https://www.npmjs.com/package/tweetnacl).
>
> If you are using `digitalbits-sdk`/`digitalbits-base` in a browser you can ignore
> this. However, for production backend deployments you should definitely be
> using `ed25519`. If `ed25519` is successfully installed and working
> `DigitalBitsSdk.FastSigning` variable will be equal `true`. Otherwise it will be
> `false`.

## Quick start

Using npm to include js-digitalbits-sdk in your own project:

```shell
npm install --save digitalbits-sdk
```

For browsers,
[use Bower to install js-digitalbits-sdk](#to-self-host-for-use-in-the-browser). It
exports a variable `DigitalBitsSdk`. The example below assumes you have
`digitalbits-sdk.js` relative to your html file.

```html
<script src="digitalbits-sdk.js"></script>
<script>
  console.log(DigitalBitsSdk);
</script>
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

#### Help! I'm having trouble installing the SDK on Windows

Unfortunately, the DigitalBits platform development team mostly works on OS X and
Linux, and so sometimes bugs creep through that are specific to windows. When
installing digitalbits-sdk on windows, you might see an error that looks similar to
the following:

```shell
error MSB8020: The build tools for v120 (Platform Toolset = 'v120 ') cannot be found. To build using the v120 build tools, please install v120 build tools.  Alternatively, you may upgrade to the current Visual Studio tools by selecting the Project menu or right-click the solution, and then selecting "Retarget solution"
```

To resolve this issue, you should upgrade your version of nodejs, node-gyp and
then re-attempt to install the offending package using
`npm install -g --msvs_version=2015 ed25519`. Afterwards, retry installing
digitalbits-sdk as normal.

If you encounter the error: "failed to find C:\OpenSSL-Win64", You need to
install OpenSSL. More information about this issue can be found
[here](https://github.com/nodejs/node-gyp/wiki/Linking-to-OpenSSL).

In the event the above does not work, please join us on our community slack to
get help resolving your issue.

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


Make sure that you are using the latest version number. They can be found on the
[releases page in Github](https://github.com/xdbfoundation/js-digitalbits-sdk/releases).

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

3. Install Node 6.14.0

Because we support earlier versions of Node, please install and develop on Node
6.14.0 so you don't get surprised when your code works locally but breaks in CI.

Here's out to install `nvm` if you haven't: https://github.com/creationix/nvm

```shell
nvm install

# if you've never installed 6.14.0 before you'll want to re-install yarn
npm install -g yarn
```

If you work on several projects that use different Node versions, you might it
helpful to install this automatic version manager:
https://github.com/wbyoung/avn

````

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
