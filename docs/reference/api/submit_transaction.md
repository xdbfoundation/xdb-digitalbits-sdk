---
title: submitTransaction()
---

## Overview

You can build a transaction locally (see [this example](../readme.md#building-transactions)), but after you build it you have to submit it to the DigitalBits network.  js-digitalbits-sdk has a function `submitTransaction()` that sends your transaction to the Frontier server (via the [`transactions_create`](https://developer.digitalbits.io/frontier/reference/transactions-create.html) endpoint) to be broadcast to the DigitalBits network.

## Methods

| Method | Frontier Endpoint | Param Type | Description |
| --- | --- | --- | --- |
| `submitTransaction(Transaction)` | [`transactions_create`](https://developer.digitalbits.io/frontier/reference/transactions-create.html) |  [`Transaction`](https://github.com/digitalbitsorg/js-digitalbits-base/blob/master/src/transaction.js) | Submits a transaction to the network.

## Example

```js
var DigitalBitsSdk = require('digitalbits-sdk')
var server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');

var transaction = new DigitalBitsSdk.TransactionBuilder(account)
        // this operation funds the new account with XLM
        .addOperation(DigitalBitsSdk.Operation.payment({
            destination: "GASOCNHNNLYFNMDJYQ3XFMI7BYHIOCFW3GJEOWRPEGK2TDPGTG2E5EDW",
            asset: DigitalBitsSdk.Asset.native(),
            amount: "20000000"
        }))
        .build();

transaction.sign(DigitalBitsSdk.Keypair.fromSeed(seedString)); // sign the transaction

server.submitTransaction(transaction)
    .then(function (transactionResult) {
        console.log(transactionResult);
    })
    .catch(function (err) {
        console.error(err);
    });
```
