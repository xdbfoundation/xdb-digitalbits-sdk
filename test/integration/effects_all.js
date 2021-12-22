const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: All Effects', function() {
   
  it('when requests All Effects than should return success response with effects', function(done) {
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
      expect(response[0].operation.href).to.be.a('string');
      expect(response[0].succeeds.href).to.be.a('string');
      expect(response[0].precedes.href).to.be.a('string');
      
      expect(response[0].id).to.be.a('string');
      expect(response[0].account).to.be.a('string');
      expect(response[0].type).to.be.a('string');

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
        .effects()
        .call();
    });
  });
});
