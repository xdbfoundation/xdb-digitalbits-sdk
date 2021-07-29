---
title: Basic Examples
---

- [Creating a payment Transaction](#creating-a-payment-transaction)
- [Loading an account's transaction history](#loading-an-accounts-transaction-history)
- [Streaming payment events](#streaming-payment-events)

## Creating a payment transaction

The `xdb-digitalbits-sdk` exposes the `TransactionBuilder` class from `xdb-digitalbits-base`.  There are more examples of [building transactions here](https://developers.digitalbits.io/xdb-digitalbits-base/reference/base-examples.html). All those examples can be signed and submitted to DigitalBits in a similar manner as is done below.

In this example, the destination account must exist. The example is written
using modern Javascript, but `await` calls can also be rendered with promises.

```javascript
// Create, sign, and submit a transaction using XDB DigitalBits SDK.

// Assumes that you have the following items:
// 1. Secret key of a funded account to be the source account
// 2. Public key of an existing account as a recipient
//    These two keys can be created and funded by the friendbot at
//    https://laboratory.livenet.digitalbits.io/#account-creator?network=test under 
//    the heading "Quick Start: Test Account"
// 3. Access to XDB DigitalBits SDK (https://github.com/xdbfoundation/xdb-digitalbits-sdk)
//    either through Node.js or in the browser.

// This code can be run in the browser at ttps://laboratory.livenet.digitalbits.io
// That site exposes a global DigitalBitsSdk object you can use.
// To run this code in the Chrome, open the console tab in the DevTools.
// The hotkey to open the DevTools console is Ctrl+Shift+J or (Cmd+Opt+J on Mac).
const DigitalBitsSdk = require('xdb-digitalbits-sdk');

// The source account is the account we will be signing and sending from.
const sourceSecretKey = 'SC422IJ7VPKGII4APQIWJIY6TPQDOU72MWWCQW6L6BQ7URZWHOZJN6W7';

// Derive Keypair object and public key (that starts with a G) from the secret
const sourceKeypair = DigitalBitsSdk.Keypair.fromSecret(sourceSecretKey);
const sourcePublicKey = sourceKeypair.publicKey();

const receiverPublicKey = 'GATYL2JFZSFM6CV5HFGUJQMK3QN3DHG57EWNVP37RVUV5GHZDDG2M7C6';

// Configure DigitalBitsSdk to talk to the frontier instance hosted by digitalbits.io
// To use the live network, set the hostname to 'frontier.livenet.digitalbits.io'
const server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');

(async function main() {
  // Transactions require a valid sequence number that is specific to this account.
  // We can fetch the current sequence number for the source account from Frontier.
  const account = await server.loadAccount(sourcePublicKey);


  // Right now, there's one function that fetches the base fee.
  // In the future, we'll have functions that are smarter about suggesting fees,
  // e.g.: `fetchCheapFee`, `fetchAverageFee`, `fetchPriorityFee`, etc.
  const fee = await server.fetchBaseFee();


  const transaction = new DigitalBitsSdk.TransactionBuilder(account, {
      fee,
      // Uncomment the following line to build transactions for the live network. Be
      // sure to also change the frontier hostname.
      // networkPassphrase: DigitalBitsSdk.Networks.PUBLIC,
      networkPassphrase: DigitalBitsSdk.Networks.TESTNET
    })
    // Add a payment operation to the transaction
    .addOperation(DigitalBitsSdk.Operation.payment({
      destination: receiverPublicKey,
      // The term native asset refers to digitalbits
      asset: DigitalBitsSdk.Asset.native(),
      // Specify 350.1234567 digitalbits. Digitalbits are divisible to seven digits past
      // the decimal. They are represented in JS DigitalBits SDK in string format
      // to avoid errors from the use of the JavaScript Number data structure.
      amount: '350.1234567',
    }))
    // Make this transaction valid for the next 30 seconds only
    .setTimeout(30)
    // Uncomment to add a memo (hhttps://developers.digitalbits.io/guides/concepts/transactions.html)
    // .addMemo(DigitalBitsSdk.Memo.text('Hello world!'))
    .build();

  // Sign this transaction with the secret key
  // NOTE: signing is transaction is network specific. Test network transactions
  // won't work in the public network. To switch networks, use the Network object
  // as explained above (look for DigitalBitsSdk.Network).
  transaction.sign(sourceKeypair);

  // Let's see the XDR (encoded in base64) of the transaction we just built
  console.log(transaction.toEnvelope().toXDR('base64'));

  // Submit the transaction to the Frontier server. The Frontier server will then
  // submit the transaction into the network for us.
  try {
    const transactionResult = await server.submitTransaction(transaction);
    console.log(JSON.stringify(transactionResult, null, 2));
    console.log('\nSuccess! View the transaction at: ');
    console.log(transactionResult._links.transaction.href);
  } catch (e) {
    console.log('An error has occured:');
    console.log(e);
  }
})();
```

## Loading an account's transaction history

Let's say you want to look at an account's transaction history.  You can use the `transactions()` command and pass in the account address to `forAccount` as the resource you're interested in.

```javascript
const DigitalBitsSdk = require('xdb-digitalbits-sdk')
const server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');
const accountId = 'GDS5URKDAYKYSITEKIW6P2YS2HUXPBTF4FMRTEII7DRF2ZMMR6SFHLQE';

server.transactions()
    .forAccount(accountId)
    .call()
    .then(function (page) {
        console.log('Page 1: ');
        console.log(page.records);
        return page.next();
    })
    .then(function (page) {
        console.log('Page 2: ');
        console.log(page.records);
    })
    .catch(function (err) {
        console.log(err);
    });
```

## Streaming payment events

xdb-digitalbits-sdk provides streaming support for Frontier endpoints using `EventSource`.  You can pass a function to handle any events that occur on the stream.

Try submitting a transaction (via the guide above) while running the following code example.

```javascript
const DigitalBitsSdk = require('xdb-digitalbits-sdk')
const server = new DigitalBitsSdk.Server('https://frontier.testnet.digitalbits.io');

// Get a message any time a payment occurs. Cursor is set to "now" to be notified
// of payments happening starting from when this script runs (as opposed to from
// the beginning of time).
const es = server.payments()
  .cursor('now')
  .stream({
    onmessage: function (message) {
      console.log(message);
    }
  })
```

For more on streaming events, please check out [the Frontier documentation](https://developers.digitalbits.io/frontier/reference/index.html) and this [guide to server-sent events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events).
