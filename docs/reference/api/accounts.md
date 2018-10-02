---
title: accounts()
---

## Overview

In order to read information about accounts from a Frontier server, the [`server`](./server.md) object provides the `accounts()` function. `accounts()` returns an `AccountCallBuilder` class, an extension of the [`CallBuilder`](./call_builder.md) class.

By default, `accounts()` provides access to the [`accounts_all`](https://developer.digitalbits.io/frontier/reference/accounts-all.html) Frontier endpoint.  By chaining an account address to it, you can reach the [`accounts_single`](https://developer.digitalbits.io/frontier/reference/accounts-single.html) endpoint.

## Methods

| Method | Frontier Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `accounts()` | [`accounts_all`](https://developer.digitalbits.io/frontier/reference/accounts-all.html) | | Access all accounts. |
| `.accountId("accountId")` | [`accounts_single`](https://developer.digitalbits.io/frontier/reference/accounts-single.html) | `string` | Pass in the ID of the account you're interested in to reach its details.|
| `.limit(limit)` | | `integer` | Limits the number of returned resources to the given `limit`.|
| `.cursor("token")` | | `string` | Return only resources after the given paging token. |
| `.order({"asc" or "desc"})` | | `string` |  Order the returned collection in "asc" or "desc" order. |
| `.call()` | | | Triggers a HTTP Request to the Frontier server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).|
| `.stream({options})` | | object of [properties](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Properties) | Creates an `EventSource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `EventSource`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). |


## Examples

```js
var DigitalBitsSdk = require('digitalbits-sdk');
var server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');

server.accounts()
  .accountId("GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGSNFHEYVXM3XOJMDS674JZ")
  .call()
  .then(function (accountResult) {
    console.log(accountResult);
  })
  .catch(function (err) {
    console.error(err);
  })
```
