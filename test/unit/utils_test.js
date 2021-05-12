const randomBytes = require("randombytes");

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
    it('returns challenge which follows SEP0010 spec', function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET
      );

      const transaction = new DigitalBitsSdk.Transaction(challenge, DigitalBitsSdk.Networks.TESTNET);

      expect(transaction.sequence).to.eql("0");
      expect(transaction.source).to.eql(keypair.publicKey());
      expect(transaction.operations.length).to.eql(1);

      const { maxTime, minTime } = transaction.timeBounds;

      expect(parseInt(maxTime) - parseInt(minTime)).to.eql(300);

      const [ operation ] =  transaction.operations;

      expect(operation.name).to.eql("SDF auth");
      expect(operation.source).to.eql("GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF");
      expect(operation.type).to.eql("manageData");
      expect(operation.value.length).to.eql(64);
      expect(Buffer.from(operation.value.toString(), 'base64').length).to.eql(48);
    });

    it('uses the passed-in timeout', function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        600,
        DigitalBitsSdk.Networks.TESTNET
      );

      const transaction = new DigitalBitsSdk.Transaction(challenge, DigitalBitsSdk.Networks.TESTNET);

      let maxTime = parseInt(transaction.timeBounds.maxTime);
      let minTime = parseInt(transaction.timeBounds.minTime);

      expect(minTime).to.eql(0);
      expect(maxTime).to.eql(600);
      expect(maxTime - minTime).to.eql(600);
    });
  });

  describe('Utils.verifyChallengeTx', function() {
    it('returns true if the transaction is valid and signed by the server and client', function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      let clientKeypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        clientKeypair.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET
      );

      clock.tick(200);

      const transaction = new DigitalBitsSdk.Transaction(challenge, DigitalBitsSdk.Networks.TESTNET);
      transaction.sign(clientKeypair);

      const signedChallenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(DigitalBitsSdk.Utils.verifyChallengeTx(signedChallenge, keypair.publicKey(), DigitalBitsSdk.Networks.TESTNET)).to.eql(true);
    });

    it('throws an error if transaction sequenceNumber if different to zero', function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "100");
      const transaction = new DigitalBitsSdk.TransactionBuilder(account, txBuilderOpts)
            .setTimeout(30)
            .build();

      let challenge = transaction
          .toEnvelope()
          .toXDR("base64")
          .toString();

      expect(
        () => DigitalBitsSdk.Utils.verifyChallengeTx(challenge, keypair.publicKey(), DigitalBitsSdk.Networks.TESTNET)
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction sequence number should be zero/
      );
    });

    it('throws an error if transaction source account is different to server account id', function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET
      );

      let serverAccountId = DigitalBitsSdk.Keypair.random().publicKey();

      expect(
        () => DigitalBitsSdk.Utils.verifyChallengeTx(challenge, serverAccountId, DigitalBitsSdk.Networks.TESTNET)
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction source account is not equal to the server's account/
      );
    });

    it('throws an error if transaction doestn\'t contain any operation', function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(account, txBuilderOpts)
            .setTimeout(30)
            .build();

      transaction.sign(keypair);
      const challenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(
        () => DigitalBitsSdk.Utils.verifyChallengeTx(challenge, keypair.publicKey(), DigitalBitsSdk.Networks.TESTNET)
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction should contain only one operation/
      );
    });

    it('throws an error if operation does not contain the source account', function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(account, txBuilderOpts)
            .addOperation(
              DigitalBitsSdk.Operation.manageData({
                name: 'SDF auth',
                value: randomBytes(48).toString('base64')
              })
            )
            .setTimeout(30)
            .build();

      transaction.sign(keypair);
      const challenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(
        () => DigitalBitsSdk.Utils.verifyChallengeTx(challenge, keypair.publicKey(), DigitalBitsSdk.Networks.TESTNET)
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation should contain a source account/
      );
    });

    it('throws an error if operation is not manage data', function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(account, txBuilderOpts)
            .addOperation(
              DigitalBitsSdk.Operation.accountMerge({
                destination: keypair.publicKey(),
                source: keypair.publicKey()
              })
            )
            .setTimeout(30)
            .build();

      transaction.sign(keypair);
      const challenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(
        () => DigitalBitsSdk.Utils.verifyChallengeTx(challenge, keypair.publicKey(), DigitalBitsSdk.Networks.TESTNET)
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation should be manageData/
      );
    });

    it('throws an error if operation value is not a 64 bytes base64 string', function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      const account = new DigitalBitsSdk.Account(keypair.publicKey(), "-1");
      const transaction = new DigitalBitsSdk.TransactionBuilder(account, txBuilderOpts)
            .addOperation(
              DigitalBitsSdk.Operation.manageData({
                name: 'SDF auth',
                value: randomBytes(64),
                source: 'GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF'
              })
            )
            .setTimeout(30)
            .build();

      transaction.sign(keypair);
      const challenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(
        () => DigitalBitsSdk.Utils.verifyChallengeTx(challenge, keypair.publicKey(), DigitalBitsSdk.Networks.TESTNET)
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction\'s operation value should be a 64 bytes base64 random string/
      );
    });

    it('throws an error if transaction is not signed by the server', function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET
      );

      const transaction = new DigitalBitsSdk.Transaction(challenge, DigitalBitsSdk.Networks.TESTNET);

      transaction.signatures = [];

      let newSigner = DigitalBitsSdk.Keypair.random();

      transaction.sign(newSigner);

      const unsignedChallenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(
        () => DigitalBitsSdk.Utils.verifyChallengeTx(unsignedChallenge, keypair.publicKey(), DigitalBitsSdk.Networks.TESTNET)
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction is not signed by the server/
      );
    });

    it('throws an error if transaction is not signed by the client', function() {
      let keypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        "GBDIT5GUJ7R5BXO3GJHFXJ6AZ5UQK6MNOIDMPQUSMXLIHTUNR2Q5CFNF",
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET
      );

      expect(
        () => DigitalBitsSdk.Utils.verifyChallengeTx(challenge, keypair.publicKey(), DigitalBitsSdk.Networks.TESTNET)
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction is not signed by the client/
      );
    });

    it('throws an error if transaction does not contain valid timeBounds', function() {
      let keypair = DigitalBitsSdk.Keypair.random();
      let clientKeypair = DigitalBitsSdk.Keypair.random();

      const challenge = DigitalBitsSdk.Utils.buildChallengeTx(
        keypair,
        clientKeypair.publicKey(),
        "SDF",
        300,
        DigitalBitsSdk.Networks.TESTNET
      );

      clock.tick(350000);

      const transaction = new DigitalBitsSdk.Transaction(challenge, DigitalBitsSdk.Networks.TESTNET);
      transaction.sign(clientKeypair);

      const signedChallenge = transaction
            .toEnvelope()
            .toXDR("base64")
            .toString();

      expect(
        () => DigitalBitsSdk.Utils.verifyChallengeTx(signedChallenge, keypair.publicKey(), DigitalBitsSdk.Networks.TESTNET)
      ).to.throw(
        DigitalBitsSdk.InvalidSep10ChallengeError,
        /The transaction has expired/
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
});
