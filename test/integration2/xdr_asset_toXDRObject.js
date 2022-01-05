const http = require("http");

const domainUrl = 'http://localhost'
const port = 8000;

describe('integration tests WIP: xdr asset toXDRObject', function() {
  let transaction
  let blob
  const destinationId = 'GCKY3VKRJDSRORRMHRDHA6IKRXMGSBRZE42P64AHX4NHVGB3Y224WM3M'
  const sourceId = '1099511631873'

  let keypair = DigitalBitsSdk.Keypair.random();
  let account = new DigitalBitsSdk.Account(keypair.publicKey(), sourceId);
  
  beforeEach(function() {
    transaction = new DigitalBitsSdk.TransactionBuilder(
        account, 
        {
          fee: 5,
          networkPassphrase: DigitalBitsSdk.Networks.TESTNET
        }
      )
      .addOperation(
        DigitalBitsSdk.Operation.payment({
          destination: destinationId,
          asset: DigitalBitsSdk.Asset.native(),
          amount: '50'
        })
      )
      .setTimeout(50000000)
      .build();
    transaction.sign(keypair);

    blob = encodeURIComponent(
      transaction
        .toEnvelope()
        .toXDR()
        .toString('base64')
    );
  });
   
  it('when requests xdr asset toXDRObject than should return success response', function(done) {
    let server;

    const requestHandler = (request, response) => {
      let xdrTestResult = DigitalBitsSdk.Asset.toXDRObject()

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
    server.listen(port, (err) => {
      if (err) {
        done(err);
        return;
      }

      new DigitalBitsSdk.Server(`${domainUrl}:${port}`, 
        { allowHttp: true })
        .toXDRObject()
        .call();
    });
  });
});
