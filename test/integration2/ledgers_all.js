const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: All Ledgers', function() {
   
  it('when requests All Ledgers than should return success response with ledgers', function(done) {
    let server;

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);
      expect(response).to.be.an('array');

      expect(response[0]).to.be.an('object');

      expect(response[0]._links).to.be.an('object');
      expect(response[0].self.href).to.be.a('string');
      expect(response[0].transactions.href).to.be.a('string');
      expect(response[0].operations.href).to.be.a('string');
      expect(response[0].payments.href).to.be.a('string');
      expect(response[0].effects.href).to.be.a('string');

      expect(response[0].id).to.be.a('string');
      expect(response[0].base_reserve_in_nibbs).to.be.a('integer');

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
        .ledgers()
        .call();
    });
  });
});
