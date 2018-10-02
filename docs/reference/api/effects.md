---
title: effects()
---

## Overview

In order to read information about effects from a Frontier server, the [`server`](./server.md) object provides the `effects()` function. `effects()` returns an `TransactionCallBuilder` class, an extension of the [`CallBuilder`](./call_builder.md) class.

By default, `effects()` provides access to the [`effects_all`](https://developer.digitalbits.io/frontier/reference/effects-all.html) Frontier endpoint.  By chaining other methods to it, you can reach other operation endpoints.

## Methods

| Method | Frontier Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `effects()` | [`effects_all`](https://developer.digitalbits.io/frontier/reference/effects-all.html)|  | Access all effects.
| `.forAccount("address")` | [`effects_for_account`](https://developer.digitalbits.io/frontier/reference/effects-for-account.html) | `string` | Pass in the address of a particular account to access its effects.|
| `.forLedger("ledgerSeq")` | [`effects_for_ledger`](https://developer.digitalbits.io/frontier/reference/effects-for-ledger.html) | `string` | Pass in the sequence of a particular ledger to access its effects. |
| `.forOperation("operationID")` | [`effects_for_operation`](https://developer.digitalbits.io/frontier/reference/effects-for-operation.html) | `string` | Pass in the ID of a particular operation to access its effects. |
| `.forTransaction("transactionHash")` | [`effects_for_transaction`](https://developer.digitalbits.io/frontier/reference/effects-for-transaction.html) | `string` |  Pass in the hash of a particular transaction to access its effects. |
| `.limit(limit)` | | `integer` | Limits the number of returned resources to the given `limit`.|
| `.cursor("token")` | | `string` | Return only resources after the given paging token. |
| `.order({"asc" or "desc"})` | | `string` |  Order the returned collection in "asc" or "desc" order. |
| `.call()` | | | Triggers a HTTP Request to the Frontier server based on the builder's current configuration.  Returns a `Promise` that resolves to the server's response.  For more on `Promise`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).|
| `.stream({options})` | | object of [properties](https://developer.mozilla.org/en-US/docs/Web/API/EventSource#Properties) | Creates an `EventSource` that listens for incoming messages from the server.  URL based on builder's current configuration.  For more on `EventSource`, see [these docs](https://developer.mozilla.org/en-US/docs/Web/API/EventSource). |


## Examples

```js
var DigitalBitsSdk = require('digitalbits-sdk');
var server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');

server.effects()
  .forTransaction("7328c64eb9d1a6663c6464a8aecea34951db49b0fd6baae6ee1faa4fd8bc2dcb")
  .call()
  .then(function (operationResult) {
    console.log(operationResult);
  })
  .catch(function (err) {
    console.error(err);
  })
```
