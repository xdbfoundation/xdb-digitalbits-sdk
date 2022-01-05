const http = require("http");

const domainUrl = 'https://frontier.testnet.digitalbits.io'
const port = 8001;

describe('integration tests: post transaction', async function() {
  let transaction
  let blob

  const sourcePublicKey = 'GAKEDNTY66RCNOC7DPILMA5EEDK6FNGYOQ7GRHIVDYZ57A37UYV4FMRR'
  const sourceSecretKey = 'SC422IJ7VPKGII4APQIWJIY6TPQDOU72MWWCQW6L6BQ7URZWHOZJN6W7';

  const sourceKeypair = DigitalBitsSdk.Keypair.fromSecret(sourceSecretKey);
  const destinationPub = 'GDYAPPD2M2ASII3MZJVIY5U4C63YRIOFUB7VFNRIODVM3TGQ3RIZLAXN'
    
  it('when requests post transaction than should return success response with post transaction', async function(done) {
    let server;
    const server2 = new DigitalBitsSdk.Server(domainUrl);

    const fee = await server2.fetchBaseFee();
    console.log('fee',fee)

    const account = await server2.loadAccount(sourcePublicKey);
      
    console.log('account',account) 

    transaction = new DigitalBitsSdk.TransactionBuilder(
        account, 
        {
          fee,
          networkPassphrase: DigitalBitsSdk.Networks.TESTNET
        }
      )
      .addOperation(
        DigitalBitsSdk.Operation.payment({
          destination: destinationPub,
          asset: DigitalBitsSdk.Asset.native(),
          amount: '5.1234567'
        })
      )
      .setTimeout(60)
      .build();
    transaction.sign(sourceKeypair);

    console.log(transaction.toEnvelope().toXDR('base64'));

    blob = encodeURIComponent(
      transaction
        .toEnvelope()
        .toXDR()
        .toString('base64')
    );

    console.log('blob',blob)

    const requestHandler = (request, response) => {
      console.log('requestHandler response',response)
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);
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

      response.end();
      server.close(() => done());
    };

    server = http.createServer(requestHandler);

    server.listen(port, async (err) => {
      if (err) {
        console.log(err);
        done(err);
        return;
      }

    try {

    let  ddServer = new DigitalBitsSdk.Server(
        `${domainUrl}`
      )

    const respo = await    ddServer.submitTransaction(
          transaction, 
          {
            skipMemoRequiredCheck: true
          }
        );

        console.log(respo);
      } catch (e) {
        console.log('An error has occured:');
        
        console.log(e);
        console.log('e.response.data.extras',e.response.data.extras);
      }
    });
  });
});
