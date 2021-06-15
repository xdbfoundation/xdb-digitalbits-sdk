const randomBytes = require("randombytes");

function newClientSigner(key, weight) {
  return { key, weight }
}

describe('Utils', function() {
  let clock, txBuilderOpts;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    txBuilderOpts = {
      fee: 100,
      networkPassphrase: DigitalBitsSdk.Networks.TESTNET
    };
  });

  afterEach(() => {
    clock.restore();
  });

  describe('Utils.buildChallengeTx', function() {
    it('requires a non-muxed account', function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      expect(() =>
        DigitalBitsSdk.Utils.buildChallengeTx(
          keypair,
          "MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6",
          "testanchor.testnet.digitalbits.io",
          300,
          DigitalBitsSdk.Networks.TESTNET,
          "testanchor.testnet.digitalbits.io"
        )
      ).to.throw(
        /Invalid clientAccountID: multiplexed accounts are not supported./
      );
    });

    it('returns challenge which follows SEP0010 spec', function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "testanchor.testnet.digitalbits.io",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      const transaction = new DigitalBitsSdk.Transaction(challenge, DigitalBitsSdk.Networks.TESTNET);

      expect(transaction.sequence).to.eql("0");
      expect(transaction.source).to.eql(keypair.publicKey());
      expect(transaction.operations.length).to.eql(2);

      const { maxTime, minTime } = transaction.timeBounds;

      expect(parseInt(maxTime) - parseInt(minTime)).to.eql(300);

      const [ operation1, operation2 ] =  transaction.operations;

      expect(operation1.name).to.eql("testanchor.testnet.digitalbits.io auth");
      expect(operation1.source).to.eql("GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF");
      expect(operation1.type).to.eql("manageData");
      expect(operation1.value.length).to.eql(64);
      expect(Buffer.from(operation1.value.toString(), 'base64').length).to.eql(48);

      expect(operation2.name).to.equal("web_auth_domain");
      expect(operation2.source).to.eql(keypair.publicKey());
      expect(operation2.type).to.eql("manageData");
      expect(operation2.value.toString()).to.eql("testanchor.testnet.digitalbits.io");
    });

    it('uses the passed-in timeout', function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "testanchor.testnet.digitalbits.io",
        600,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      const transaction = new DigitalBitsSdk.Transaction(challenge, DigitalBitsSdk.Networks.TESTNET);

      let maxTime = parseInt(transaction.timeBounds.maxTime);
      let minTime = parseInt(transaction.timeBounds.minTime);

      expect(minTime).to.eql(0);
      expect(maxTime).to.eql(600);
      expect(maxTime - minTime).to.eql(600);
    });
  });

  describe("Utils.readChallengeTx", function() {
    it('requires a non-muxed account', function() {
      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          "avalidtx",
          "MAAAAAAAAAAAAAB7BQ2L7E5NBWMXDUCMZSIPOBKRDSBYVLMXGSSKF6YNPIB7Y77ITLVL6",
          "SDF",
          300,
          DigitalBitsSdk.Networks.TESTNET,
          "testanchor.testnet.digitalbits.io",
          "testanchor.testnet.digitalbits.io"
        )
      ).to.throw(
        /Invalid serverAccountID: multiplexed accounts are not supported./
      );
    });
    it("requires a envelopeTypeTxV0 or envelopeTypeTx", function(){
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        serverKP,
        clientKP.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      const innerTx = new DigitalBitsSdk.TransactionBuilder(new DigitalBitsSdk.Account(clientKP.publicKey(), "0"), {
        fee: '100',
        networkPassphrase: DigitalBitsSdk.Networks.TESTNET,
        timebounds: {
          minTime: 0,
          maxTime: 0
        }
      })
        .addOperation(
          DigitalBitsSdk.Operation.payment({
            destination: clientKP.publicKey(),
            asset: DigitalBitsSdk.Asset.native(),
            amount: "10.000"
          })
        )
        .build();

      let feeBump = DigitalBitsSdk.TransactionBuilder.buildFeeBumpTransaction(
        serverKP,
        "300",
        innerTx,
        DigitalBitsSdk.Networks.TESTNET
      ).toXDR();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          feeBump,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        )
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /Invalid challenge: expected a Transaction but received a FeeBumpTransaction/
      );

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        )
      ).to.not.throw(DigitalBitsSdk.InvalidSep10ChallengeError);
      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          feeBump.toXDR().toString('base64'),
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        )
      ).to.not.throw(DigitalBitsSdk.InvalidSep10ChallengeError);
    });
    it("returns the transaction and the clientAccountID (client's pubKey) if the challenge was created successfully", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        serverKP,
        clientKP.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        )
      ).to.eql({
        tx: transaction,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "SDF",
      });
    });

    it("throws an error if transaction sequenceNumber is different to zero", function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "100");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .setTimeout(30)
        .build();

      let challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction sequence number should be zero/,
      );
    });

    it("throws an error if transaction source account is different to server account id", function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      let serverAccountId = DigitalBitsSdk.Keypair.random().publicKey();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverAccountId,
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction source account is not equal to the server's account/,
      );
    });

    it("throws an error if transaction doestn't contain any operation", function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction should contain at least one operation/,
      );
    });

    it("throws an error if operation does not contain the source account", function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation should contain a source account/,
      );
    });

    it("throws an error if operation is not manage data", function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.accountMerge({
            destination: keypair.publicKey(),
            source: keypair.publicKey(),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation type should be \'manageData\'/,
      );
    });

    it("throws an error if transaction.timeBounds.maxTime is infinite", function() {
      let serverKeypair = DigitalBitsSdk.Keypair.random();
      let clientKeypair = DigitalBitsSdk.Keypair.random();

      const anchorName = "SDF";
      const networkPassphrase = DigitalBitsSdk.Networks.TESTNET;

      const account = new DigitalBitsSdk.Account(serverKeypair.publicKey(), "-1");
      const now = Math.floor(Date.now() / 1000);

      const value = randomBytes(48).toString("base64");

      let transaction = new DigitalBitsSdk.TransactionBuilder(account, {
        fee: DigitalBitsSdk.BASE_FEE,
        networkPassphrase,
        timebounds: {
          minTime: now,
          maxTime: "0",
        },
      })
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            name: `${anchorName} auth`,
            value,
            source: clientKeypair.publicKey(),
          }),
        )
        .build();

      transaction.sign(serverKeypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(clientKeypair);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          signedChallenge,
          serverKeypair.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          anchorName,
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction requires non-infinite timebounds/,
      );
    });

    it("throws an error if operation value is not a 64 bytes base64 string", function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            name: "SDF auth",
            value: randomBytes(64),
            source: "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation value should be a 64 bytes base64 random string/,
      );
    });

    it("throws an error if operation value is null", function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        account,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            name: "SDF auth",
            value: null,
            source: "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(keypair);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          keypair.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation values should not be null/,
      );
    });

    it("throws an error if transaction does not contain valid timeBounds", function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      let clientKeypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        clientKeypair.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(350000);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(clientKeypair);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          signedChallenge,
          keypair.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction has expired/,
      );
    });

    it("home domain string matches transaction\'s operation key name", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.testnet.digitalbits.io auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "testanchor.testnet.digitalbits.io",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.testnet.digitalbits.io",
      });
    });

    it("home domain in array matches transaction\'s operation key name", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.testnet.digitalbits.io auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          ["SDF", "Test", "testanchor.testnet.digitalbits.io", "SDF-test"],
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.testnet.digitalbits.io",
      });
    });

    it("throws an error if home domain is not provided", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.testnet.digitalbits.io auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          // home domain not provided
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /Invalid homeDomains: a home domain must be provided for verification/,
      );
    });

    it("throws an error if home domain type is not string or array", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.testnet.digitalbits.io auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          // home domain as number
          1,
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /Invalid homeDomains: homeDomains type is number but should be a string or an array/,
      );
    });

    it("throws an error if home domain string does not match transaction\'s operation key name", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "does.not.match auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "testanchor.testnet.digitalbits.io",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /Invalid homeDomains: the transaction\'s operation key name does not match the expected home domain/,
      );
    });

    it("throws an error if home domain array does not have a match to transaction\'s operation key name", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "does.not.match auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          ["SDF", "Test", "testanchor.testnet.digitalbits.io", "SDF-test"],
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /Invalid homeDomains: the transaction\'s operation key name does not match the expected home domain/,
      );
    });

    it("allows transaction to contain subsequent manage data ops with server account as source account", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: serverKP.publicKey(),
            name: "a key",
            value: "a value",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "SDF",
      });
    });

    it("throws an error if the transaction contain subsequent manage data ops without the server account as the source account", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "a key",
            value: "a value",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction has operations that are unrecognized/,
      );
    });

    it("throws an error if the transaction contain subsequent ops that are not manage data ops", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "SDF auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          DigitalBitsSdk.Operation.bumpSequence({
            source: clientKP.publicKey(),
            bumpTo: "0",
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction has operations that are not of type 'manageData'/,
      );
    });

    it("throws an error if the provided webAuthDomain does not match the 'web_auth_domain' operation's value", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.testnet.digitalbits.io auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: serverKP.publicKey(),
            name: "web_auth_domain",
            value: "unexpected_web_auth_domain"
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "testanchor.testnet.digitalbits.io",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /'web_auth_domain' operation value does not match testanchor.testnet.digitalbits.io/
      );
    });

    it("throws an error if the 'web_auth_domain' operation's source account is not the server's public key", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.testnet.digitalbits.io auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "web_auth_domain",
            value: "testanchor.testnet.digitalbits.io"
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(() =>
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "testanchor.testnet.digitalbits.io",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction has operations that are unrecognized/
      );
    });

    it("allows transaction to omit the 'web_auth_domain' operation", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.testnet.digitalbits.io auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "testanchor.testnet.digitalbits.io",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.testnet.digitalbits.io",
      });
    });

    it("matches the 'web_auth_domain' operation value with webAuthDomain", function() {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.testnet.digitalbits.io auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: serverKP.publicKey(),
            name: "web_auth_domain",
            value: "auth.testnet.digitalbits.io"
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "testanchor.testnet.digitalbits.io",
          "auth.testnet.digitalbits.io"
        ),
      ).to.eql({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.testnet.digitalbits.io",
      });
    });

    it("allows subsequent manageData operations to have undefined values", () => {
      let serverKP = DigitalBitsSdk.Keypair.random();
      let clientKP = DigitalBitsSdk.Keypair.random();
      const serverAccount = new DigitalBitsSdk.Account(serverKP.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        serverAccount,
        txBuilderOpts,
      )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: clientKP.publicKey(),
            name: "testanchor.testnet.digitalbits.io auth",
            value: randomBytes(48).toString("base64"),
          }),
        )
        .addOperation(
          DigitalBitsSdk.Operation.manageData({
            source: serverKP.publicKey(),
            name: "nonWebAuthDomainKey",
            value: null
          }),
        )
        .setTimeout(30)
        .build();

      transaction.sign(serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const transactionRoundTripped = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(
        DigitalBitsSdk.Utils.readChallengeTx(
          challenge,
          serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          "testanchor.testnet.digitalbits.io",
          "auth.testnet.digitalbits.io"
        ),
      ).to.eql({
        tx: transactionRoundTripped,
        clientAccountID: clientKP.publicKey(),
        matchedHomeDomain: "testanchor.testnet.digitalbits.io",
      });
    });
  });

  describe("Utils.verifyChallengeTxThreshold", function() {
    beforeEach(function() {
      this.serverKP = DigitalBitsSdk.Keypair.random();
      this.clientKP1 = DigitalBitsSdk.Keypair.random();
      this.clientKP2 = DigitalBitsSdk.Keypair.random();
      this.clientKP3 = DigitalBitsSdk.Keypair.random();

      this.txAccount = new DigitalBitsSdk.Account(this.serverKP.publicKey(), "-1");
      this.opAccount = new DigitalBitsSdk.Account(this.clientKP1.publicKey(), "0");

      this.operation = DigitalBitsSdk.Operation.manageData({
        source: this.clientKP1.publicKey(),
        name: "SDF-test auth",
        value: randomBytes(48).toString("base64"),
      });

      this.txBuilderOpts = {
        fee: 100,
        networkPassphrase: DigitalBitsSdk.Networks.TESTNET,
      };
    });

    afterEach(function() {
      this.serverKP, this.clientKP1, this.clientKP2, this.txAccount, this.opAccount, this.operation = null;
    });

    it("throws an error if the server hasn't signed the transaction", function() {
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        this.txAccount,
        this.txBuilderOpts,
      )
        .addOperation(this.operation)
        .setTimeout(30)
        .build();

      const threshold = 1;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1)
      ];

      transaction.sign(this.clientKP1);

      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxThreshold(
          challenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF-test",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        "Transaction not signed by server: '" + this.serverKP.publicKey() + "'",
      );
    });

    it("successfully validates server and client key meeting threshold", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 1;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1)
      ];

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql([this.clientKP1.publicKey()]);
    });

    it("successfully validates server and multiple client keys, meeting threshold", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 3;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2)
      ];

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql([this.clientKP1.publicKey(), this.clientKP2.publicKey()]);
    });

    it("successfully validates server and multiple client keys, meeting threshold with more keys than needed", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 3;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2),
        newClientSigner(this.clientKP3.publicKey(), 2)
      ];

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql([this.clientKP1.publicKey(), this.clientKP2.publicKey()]);
    });

    it("successfully validates server and multiple client keys, meeting threshold with more keys than needed but ignoring PreauthTxHash and XHash", function() {
      const preauthTxHash = "TAQCSRX2RIDJNHFIFHWD63X7D7D6TRT5Y2S6E3TEMXTG5W3OECHZ2OG4";
      const xHash = "XDRPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";
      const unknownSignerType = "?ARPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 3;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2),
        newClientSigner(this.clientKP3.publicKey(), 2),
        newClientSigner(preauthTxHash, 10),
        newClientSigner(xHash, 10),
        newClientSigner(unknownSignerType, 10),
      ];

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql([this.clientKP1.publicKey(), this.clientKP2.publicKey()]);
    });

    it("throws an error if multiple client keys were not enough to meet the threshold", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 10;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2),
        newClientSigner(this.clientKP3.publicKey(), 2),
      ];

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        `signers with weight 3 do not meet threshold ${threshold}"`,
      );
    });

    it("throws an error if an unrecognized (not from the signerSummary) key has signed the transaction", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2, this.clientKP3);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 10;
      const signerSummary = [
        newClientSigner(this.clientKP1.publicKey(), 1),
        newClientSigner(this.clientKP2.publicKey(), 2),
      ];

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          threshold,
          signerSummary,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /Transaction has unrecognized signatures/,
      );
    });

    it("throws an error if the signerSummary is empty", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1, this.clientKP2, this.clientKP3);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const threshold = 10;

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxThreshold(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          threshold,
          [],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /No verifiable client signers provided, at least one G... address must be provided/,
      );
    });
  });

  describe("Utils.verifyChallengeTxSigners", function() {
    beforeEach(function() {
      this.serverKP = DigitalBitsSdk.Keypair.random();
      this.clientKP1 = DigitalBitsSdk.Keypair.random();
      this.clientKP2 = DigitalBitsSdk.Keypair.random();

      this.txAccount = new DigitalBitsSdk.Account(this.serverKP.publicKey(), "-1");
      this.opAccount = new DigitalBitsSdk.Account(this.clientKP1.publicKey(), "0");

      this.operation = DigitalBitsSdk.Operation.manageData({
        source: this.clientKP1.publicKey(),
        name: "SDF-test auth",
        value: randomBytes(48).toString("base64"),
      });

      this.txBuilderOpts = {
        fee: 100,
        networkPassphrase: DigitalBitsSdk.Networks.TESTNET,
      };
    });

    afterEach(function() {
      this.serverKP, this.clientKP1, this.clientKP2, this.txAccount, this.opAccount, this.operation = null;
    });

    it("successfully validates server and client master key signatures in the transaction", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP1.publicKey()],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql([this.clientKP1.publicKey()]);
    });

    it("throws an error if the server hasn't signed the transaction", function() {
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        this.txAccount,
        this.txBuilderOpts,
      )
        .addOperation(this.operation)
        .setTimeout(30)
        .build();

      transaction.sign(DigitalBitsSdk.Keypair.random()); // Signing with another key pair instead of the server's

      const invalidsServerSignedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          invalidsServerSignedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP1.publicKey()],
          "SDF-test",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        "Transaction not signed by server: '" + this.serverKP.publicKey() + "'",
      );
    });

    it("throws an error if the list of signers is empty", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          challenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /No verifiable client signers provided, at least one G... address must be provided/,
      );
    });

    it("throws an error if none of the given signers have signed the transaction", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(DigitalBitsSdk.Keypair.random(), DigitalBitsSdk.Keypair.random());
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP1.publicKey()],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /None of the given signers match the transaction signatures/,
      );
    });

    it("successfully validates server and multiple client signers in the transaction", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      const clientSigners = [this.clientKP1, this.clientKP2];
      transaction.sign(...clientSigners);
      const clientSignersPubKey = clientSigners.map(kp => kp.publicKey());

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          clientSignersPubKey,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql(clientSignersPubKey);
    });

    it("successfully validates server and multiple client signers, in reverse order", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      const clientSigners = [this.clientKP1, this.clientKP2];
      transaction.sign(...clientSigners.reverse());
      const clientSignersPubKey = clientSigners.map(kp => kp.publicKey());

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          clientSignersPubKey,
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.have.same.members(clientSignersPubKey);
    });

    it("successfully validates server and non-masterkey client signer", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP2.publicKey()],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql([this.clientKP2.publicKey()]);
    });

    it("successfully validates server and non-master key client signer, ignoring extra signer", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), DigitalBitsSdk.Keypair.random().publicKey()],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql([this.clientKP2.publicKey()]);
    });

    it("throws an error if no client but insted the server has signed the transaction", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.serverKP);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), this.serverKP.publicKey()],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /None of the given signers match the transaction signatures/,
      );
    });

    it("successfully validates server and non-masterkey client signer, ignoring duplicated client signers", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), this.clientKP2.publicKey()],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql([this.clientKP2.publicKey()]);
    });

    it("successfully validates server and non-masterkey client signer, ignoring preauthTxHash and xHash", function() {
      const preauthTxHash = "TAQCSRX2RIDJNHFIFHWD63X7D7D6TRT5Y2S6E3TEMXTG5W3OECHZ2OG4";
      const xHash = "XDRPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";
      const unknownSignerType = "?ARPF6NZRR7EEVO7ESIWUDXHAOMM2QSKIQQBJK6I2FB7YKDZES5UCLWD";

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), preauthTxHash, xHash, unknownSignerType],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.eql([this.clientKP2.publicKey()]);
    });

    it("throws an error if duplicated signers have been provided and they haven't actually signed the transaction", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1);
      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP2.publicKey(), this.clientKP2.publicKey()],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /None of the given signers match the transaction signatures/,
      );
    });

    it("throws an error if the same KP has signed the transaction more than once", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2, this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP2.publicKey()],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /Transaction has unrecognized signatures/,
      );
    });

    it("throws an error if the client attempts to verify the transaction with a Seed instead of the Public Key", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP2, this.clientKP2);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [this.clientKP2.secret()],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /No verifiable client signers provided, at least one G... address must be provided/,
      );
    });

    it("throws an error if no client has signed the transaction", function() {
      const transaction = new DigitalBitsSdk.TransactionBuilder(
        this.txAccount,
        this.txBuilderOpts,
      )
        .addOperation(this.operation)
        .setTimeout(30)
        .build();

      transaction.sign(this.serverKP);
      const challenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      const clientSigners = [
        this.clientKP1.publicKey(),
        this.clientKP2.publicKey(),
      ];

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          challenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          clientSigners,
          "SDF-test",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /None of the given signers match the transaction signatures/,
      );
    });

    it("throws an error if no public keys were provided to verify signatires", function() {
      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        this.serverKP,
        this.clientKP1.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET,
        "testanchor.testnet.digitalbits.io"
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(
        challenge,
        DigitalBitsSdk.Networks.TESTNET,
      );
      transaction.sign(this.clientKP1);

      const signedChallenge = transaction
        .toEnvelope()
        .toXDR("base64")
        .toString();

      expect(() =>
        DigitalBitsSdk.Utils.verifyChallengeTxSigners(
          signedChallenge,
          this.serverKP.publicKey(),
          DigitalBitsSdk.Networks.TESTNET,
          [],
          "SDF",
          "testanchor.testnet.digitalbits.io"
        ),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /No verifiable client signers provided, at least one G... address must be provided/,
      );
    });
  });

  describe('Utils.verifyTxSignedBy', function() {
    beforeEach(function() {
      this.keypair = DigitalBitsSdk.Keypair.random();
      this.account = new DigitalBitsSdk.Account(this.keypair.publicKey(), "-1");
      this.transaction = new DigitalBitsSdk.TransactionBuilder(this.account, txBuilderOpts)
        .setTimeout(30)
        .build();
    });

    afterEach(function() {
      this.keypair, this.account, this.transaction = null;
    });

    it('returns true if the transaction was signed by the given account', function() {
      this.transaction.sign(this.keypair);

      expect(DigitalBitsSdk.Utils.verifyTxSignedBy(this.transaction, this.keypair.publicKey())).to.eql(true);
    });

    it('returns false if the transaction was not signed by the given account', function() {
      this.transaction.sign(this.keypair);

      let differentKeypair = DigitalBitsSdk.Keypair.random();

      expect(DigitalBitsSdk.Utils.verifyTxSignedBy(this.transaction, differentKeypair.publicKey())).to.eql(false);
    });

    it('works with an unsigned transaction', function() {
      expect(DigitalBitsSdk.Utils.verifyTxSignedBy(this.transaction, this.keypair.publicKey())).to.eql(false);
    });
  });

  describe("Utils.gatherTxSigners", function() {
    beforeEach(function() {
      this.keypair1 = DigitalBitsSdk.Keypair.random();
      this.keypair2 = DigitalBitsSdk.Keypair.random();
      this.account = new DigitalBitsSdk.Account(this.keypair1.publicKey(), "-1");
      this.transaction = new DigitalBitsSdk.TransactionBuilder(
        this.account,
        txBuilderOpts,
      )
        .setTimeout(30)
        .build();
    });

    afterEach(function() {
      this.keypair1, this.keypair2, this.account, this.transaction = null;
    });

    it("returns a list with the signatures used in the transaction", function() {
      this.transaction.sign(this.keypair1, this.keypair2);

      const expectedSignatures = [
        this.keypair1.publicKey(),
        this.keypair2.publicKey(),
      ];
      expect(
        DigitalBitsSdk.Utils.gatherTxSigners(this.transaction, expectedSignatures),
      ).to.eql(expectedSignatures);
    });

    it("returns a list with the signatures used in the transaction, removing duplicates", function() {
      this.transaction.sign(
        this.keypair1,
        this.keypair1,
        this.keypair1,
        this.keypair2,
        this.keypair2,
        this.keypair2,
      );

      const expectedSignatures = [
        this.keypair1.publicKey(),
        this.keypair2.publicKey(),
      ];
      expect(
        DigitalBitsSdk.Utils.gatherTxSigners(this.transaction, [
          this.keypair1.publicKey(),
          this.keypair2.publicKey(),
        ]),
      ).to.eql(expectedSignatures);
    });

    it("returns an empty list if the transaction was not signed by the given accounts", function() {
      this.transaction.sign(this.keypair1, this.keypair2);

      let wrongSignatures = [
        DigitalBitsSdk.Keypair.random().publicKey(),
        DigitalBitsSdk.Keypair.random().publicKey(),
        DigitalBitsSdk.Keypair.random().publicKey(),
      ];

      expect(
        DigitalBitsSdk.Utils.gatherTxSigners(this.transaction, wrongSignatures),
      ).to.eql([]);
    });

    it("calling gatherTxSigners with an unsigned transaction will return an empty list", function() {
      expect(
        DigitalBitsSdk.Utils.gatherTxSigners(this.transaction, [
          this.keypair1.publicKey(),
          this.keypair2.publicKey(),
        ]),
      ).to.eql([]);
    });

    it("Raises an error in case one of the given signers is not a valid G signer", function() {
      this.transaction.sign(this.keypair1, this.keypair2);
      const preauthTxHash = "TAQCSRX2RIDJNHFIFHWD63X7D7D6TRT5Y2S6E3TEMXTG5W3OECHZ2OG4";
      expect(
        () => DigitalBitsSdk.Utils.gatherTxSigners(this.transaction, [preauthTxHash, this.keypair1.publicKey()]),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /Signer is not a valid address/
      );
    });

    it("Raises an error in case one of the given signers is an invalid G signer", function() {
      this.transaction.sign(this.keypair1, this.keypair2);
      const invalidGHash = "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CAAA";
      expect(
        () => DigitalBitsSdk.Utils.gatherTxSigners(this.transaction, [invalidGHash, this.keypair1.publicKey()]),
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /Signer is not a valid address/
      );
    });
  });
});
