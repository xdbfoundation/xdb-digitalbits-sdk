const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: transaction for account', function() {
   
  it('when requests transaction for account than should return success response with transaction for account', function(done) {
    let server;
    const itemId = 'GCHQ6AOZST6YPMROCQWPE3SVFY57FHPYC3WJGGSFCHOQ5HFZC5HSHQYK'

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);   
      expect(response).to.be.an('array');
      expect(response[0]).to.be.an('object');

      expect(response[0]._links).to.be.an('object');
      expect(response[0]._links.self.href).to.be.a('string');
      expect(response[0]._links.account.href).to.be.a('string');
      expect(response[0]._links.ledger.href).to.be.a('string');
      expect(response[0]._links.operations.href).to.be.a('string');
      expect(response[0]._links.effects.href).to.be.a('string');
      expect(response[0]._links.precedes.href).to.be.a('string');
      expect(response[0]._links.succeeds.href).to.be.a('string');
      expect(response[0]._links.transaction.href).to.be.a('string');

      expect(response[0].id).to.be.a('string');
      expect(response[0].paging_token).to.be.a('string');
      expect(response[0].successful).to.be.a('boolean');
      expect(response[0].hash).to.be.a('string');

      expect(response[0].created_at).to.be.a('string');
      expect(response[0].source_account).to.be.a('string');
      expect(response[0].source_account_sequence).to.be.a('string');

      expect(response[0].fee_account).to.be.a('string');
      expect(response[0].fee_charged).to.be.a('string');
      expect(response[0].max_fee).to.be.a('string');
      expect(response[0].operation_count).to.be.a('string');

      expect(response[0].envelope_xdr).to.be.a('string');
      expect(response[0].result_xdr).to.be.a('string');
      expect(response[0].result_meta_xdr).to.be.a('string');
      expect(response[0].fee_meta_xdr).to.be.a('string');
      expect(response[0].memo_type).to.be.a('string');

      expect(response[0].signatures).to.be.an('array');
      expect(response[0].signatures[0]).to.be.a('string');

      expect(response[0].valid_after).to.be.a('string');
      expect(response[0].valid_before).to.be.a('string');
      expect(response[0].ledger_attr).to.be.a('integer');
     
      response.end();
      server.close(() => done());
    };

    server = http.createServer(requestHandler);
    server.listen(port, (err) => {
      if (err) {
        done(err);
        return;
      }

      new DigitalBitsSdk.Server(`http://localhost:${port}`, { allowHttp: true })
        .transactions()
        .forAccount(itemId)
        .limit("1")
        .call();
    });
  });
});
