const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: payments for transaction', function() {
   
  it('when requests payments for transaction than should return success response with payments for transaction', function(done) {
    let server;
    const itemId = 'c60f666cda020d13033bb44926adf7f6c2b659857f13959e3988351055c0b52f'

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);   
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');
      
      expect(response.records[0]).to.be.an('object');

      expect(response.records[0]._links).to.be.an('object');
      expect(response.records[0]._links.self.href).to.be.a('string');
      expect(response.records[0]._links.transaction.href).to.be.a('string');
      expect(response.records[0]._links.effects.href).to.be.a('string');
      expect(response.records[0]._links.succeeds.href).to.be.a('string');
      expect(response.records[0]._links.precedes.href).to.be.a('string');

      expect(response.records[0].id).to.be.a('string');
      expect(response.records[0].paging_token).to.be.a('string');
      expect(response.records[0].transaction_successful).to.be.a('boolean');
      expect(response.records[0].source_account).to.be.a('string');
      expect(response.records[0].type).to.be.a('string');
      expect(response.records[0].created_at).to.be.a('string');
      expect(response.records[0].transaction_hash).to.be.a('string');
     
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
        .payments()
        .forTransaction(itemId)
        .limit("1")
        .call();
    });
  });
});
