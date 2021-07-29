---
title: Overview
---

The JavaScript DigitalBits SDK facilitates integration with the [DigitalBits Frontier API server](https://developers.digitalbits.io/frontier/reference/) and submission of DigitalBits transactions, either on Node.js or in the browser. It has two main uses: [querying Frontier](#querying-frontier) and [building, signing, and submitting transactions to the DigitalBits network](#building-transactions).

[Building and installing xdb-digitalbits-sdk](https://github.com/xdbfoundation/xdb-digitalbits-sdk)

[Examples of using xdb-digitalbits-sdk](https://developers.digitalbits.io/xdb-digitalbits-sdk/reference/examples.html)

# Querying Frontier
xdb-digitalbits-sdk gives you access to all the endpoints exposed by Frontier.

## Building requests
xdb-digitalbits-sdk uses the [Builder pattern](https://en.wikipedia.org/wiki/Builder_pattern) to create the requests to send
to Frontier. Starting with a server object, you can chain methods together to generate a query.
(See the [Frontier reference](https://developers.digitalbits.io/frontier/reference/index.html) documentation for what methods are possible.)

```javascript
var DigitalBitsSdk = require('xdb-digitalbits-sdk');
var server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');
// get a list of transactions that occurred in ledger 1400
server.transactions()
    .forLedger(957773)
    .call().then(function(r){ console.log(r); });

// get a list of transactions submitted by a particular account
server.transactions()
    .forAccount('GDFOHLMYCXVZD2CDXZLMW6W6TMU4YO27XFF2IBAFAV66MSTPDDSK2LAY')
    .call().then(function(r){ console.log(r); });
```

Once the request is built, it can be invoked with `.call()` or with `.stream()`. `call()` will return a
[promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) to the response given by Frontier.

## Streaming requests
Many requests can be invoked with `stream()`. Instead of returning a promise like `call()` does, `.stream()` will return an `EventSource`.
Frontier will start sending responses from either the beginning of time or from the point specified with `.cursor()`.
(See the [Frontier reference](https://developers.digitalbits.io/frontier/reference/index.html) documentation to learn which endpoints support streaming.)

For example, to log instances of transactions from a particular account:

```javascript
var DigitalBitsSdk = require('xdb-digitalbits-sdk')
var server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');
var lastCursor=0; // or load where you left off

var txHandler = function (txResponse) {
    console.log(txResponse);
};

var es = server.transactions()
    .forAccount(accountAddress)
    .cursor(lastCursor)
    .stream({
        onmessage: txHandler
    })
```

## Handling responses

### XDR
The transaction endpoints will return some fields in raw [XDR](https://developers.digitalbits.io/guides/concepts/xdr.html)
form. You can convert this XDR to JSON using the `.fromXDR()` method.

An example of re-writing the txHandler from above to print the XDR fields as JSON:

```javascript
var txHandler = function (txResponse) {
    console.log( JSON.stringify(DigitalBitsSdk.xdr.TransactionEnvelope.fromXDR(txResponse.envelope_xdr, 'base64')) );
    console.log( JSON.stringify(DigitalBitsSdk.xdr.TransactionResult.fromXDR(txResponse.result_xdr, 'base64')) );
    console.log( JSON.stringify(DigitalBitsSdk.xdr.TransactionMeta.fromXDR(txResponse.result_meta_xdr, 'base64')) );
};

```


### Following links
The [HAL format](https://developers.digitalbits.io/frontier/reference/responses.html) links returned with the Frontier response are converted into functions you can call on the returned object.
This allows you to simply use `.next()` to page through results. It also makes fetching additional info, as in the following example, easy:

```js
server.payments()
    .limit(1)
    .call()
    .then(function(response){
        // will follow the transactions link returned by Frontier
        response.records[0].transaction().then(function(txs){
            console.log(txs);
        });
    });
```


# Transactions

## Building transactions

See the [Building Transactions](https://developers.digitalbits.io/xdb-digitalbits-base/reference/building-transactions.html) guide for information about assembling a transaction.

## Submitting transactions
Once you have built your transaction, you can submit it to the DigitalBitsnetwork with `Server.submitTransaction()`.

```javascript
const DigitalBitsSdk = require('xdb-digitalbits-sdk')
const server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');

(async function main() {
    const account = await server.loadAccount(publicKey);

    /*
        Right now, we have one function that fetches the base fee.
        In the future, we'll have functions that are smarter about suggesting fees,
        e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
    */
    const fee = await server.fetchBaseFee();

    const transaction = new DigitalBitsSdk.TransactionBuilder(account, { fee, networkPassphrase: DigitalBitsSdk.Networks.TESTNET })
        .addOperation(
            // this operation funds the new account with XDB
            DigitalBitsSdk.Operation.payment({
                destination: "GATYL2JFZSFM6CV5HFGUJQMK3QN3DHG57EWNVP37RVUV5GHZDDG2M7C6",
                asset: DigitalBitsSdk.Asset.native(),
                amount: "100"
            })
        )
        .setTimeout(30)
        .build();

    // sign the transaction
    transaction.sign(DigitalBitsSdk.Keypair.fromSecret(secretString));

    try {
        const transactionResult = await server.submitTransaction(transaction);
        console.log(transactionResult);
    } catch (err) {
        console.error(err);
    }
})()
```
