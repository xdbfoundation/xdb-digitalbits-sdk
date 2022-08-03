/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;

const sourcePublicKey = testConfig.accounts.sourcePublicKey;
const sourceSecretKey = testConfig.accounts.sourceSecretKey;

const destinationPublicKey = testConfig.accounts.destinationPublicKey;

describe('integration tests: post transaction', function() {
  this.timeout(50000);

  let server;
  let transaction;
  let fee;
  let account;   

  const sourceKeypair = DigitalBitsSdk.Keypair.fromSecret(sourceSecretKey);
  
  beforeEach(async function() {
    server = new DigitalBitsSdk.Server(domainUrl);
    fee = await server.fetchBaseFee();
    account = await server.loadAccount(sourcePublicKey);
  });
    
  it('when requests post transaction than should return success response with post transaction', async function() {
    transaction = new DigitalBitsSdk.TransactionBuilder(
        account, 
        {
          fee,
          networkPassphrase: DigitalBitsSdk.Networks.TESTNET
        }
      )
      .addOperation(
        DigitalBitsSdk.Operation.payment({
          destination: destinationPublicKey,
          asset: DigitalBitsSdk.Asset.native(),
          amount: '5.1234567'
        })
      )
      .setTimeout(6000)
      .build();
    transaction.sign(sourceKeypair);

   /// console.log(transaction.toEnvelope().toXDR('base64'));

    const expectHandler = (response) => {
      console.log('expectHandler response', response);

      expect(response).to.be.an('object');

      expect(response._links).to.be.an('object');
      expect(response._links.self.href).to.be.a('string');
      expect(response._links.account.href).to.be.a('string');
      expect(response._links.ledger.href).to.be.a('string');
      expect(response._links.operations.href).to.be.a('string');
      expect(response._links.effects.href).to.be.a('string');
      expect(response._links.precedes.href).to.be.a('string');
      expect(response._links.succeeds.href).to.be.a('string');
      expect(response._links.transaction.href).to.be.a('string');

      expect(response.id).to.be.a('string');
      expect(response.paging_token).to.be.a('string');
      expect(response.successful).to.be.a('boolean');
      expect(response.hash).to.be.a('string');

      expect(response.ledger).to.be.a('integer');
      expect(response.created_at).to.be.a('string');
      expect(response.source_account).to.be.a('string');
      expect(response.source_account_sequence).to.be.a('string');

      expect(response.fee_account).to.be.a('string');
      expect(response.fee_charged).to.be.a('string');
      expect(response.max_fee).to.be.a('string');
      expect(response.operation_count).to.be.a('string');

      expect(response.envelope_xdr).to.be.a('string');
      expect(response.result_xdr).to.be.a('string');
      expect(response.result_meta_xdr).to.be.a('string');
      expect(response.fee_meta_xdr).to.be.a('string');
      expect(response.memo_type).to.be.a('string');

      expect(response.signatures).to.be.an('array');
      expect(response.signatures[0]).to.be.a('string');

      expect(response.valid_after).to.be.a('string');
      expect(response.valid_before).to.be.a('string');
    }

    try {
      const txServer = new DigitalBitsSdk.Server(`${domainUrl}`)

      const response = await txServer.submitTransaction(
          transaction, 
          {
            skipMemoRequiredCheck: true
          }
        );

      expectHandler(response)      
    } catch (e) {
      console.log('An error has occured:');
      
      console.log(e);
      console.log('e.response.data.extras',e.response.data.extras);
    }
  });    
});
