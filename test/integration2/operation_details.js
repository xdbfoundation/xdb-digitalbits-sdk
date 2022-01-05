const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: operation details', function() {
   
  it('when requests operation details than should return success response with operation details', function(done) {
    let server;
    const itemId = '1099511631873'

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);   
      expect(response).to.be.an('object');

      expect(response._links).to.be.an('object');
      expect(response._links.self.href).to.be.a('string');
      expect(response._links.transaction.href).to.be.a('string');
      expect(response._links.effects.href).to.be.a('string');
      expect(response._links.succeeds.href).to.be.a('string');
      expect(response._links.precedes.href).to.be.a('string');

      expect(response.id).to.be.a('string');

      expect(response.paging_token).to.be.a('string');
      expect(response.transaction_successful).to.be.a('boolean');
      expect(response.source_account).to.be.a('string');
      expect(response.type).to.be.a('string');
      expect(response.created_at).to.be.a('string');
      expect(response.transaction_hash).to.be.a('string');
     
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
        .operations()
        .operation(itemId)
        .call();
    });
  });
});
