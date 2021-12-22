const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: All Assets', function() {
   
  it('when requests All Assets than should return success response with assets', function(done) {
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
      expect(response[0].toml.href).to.be.a('string');

      expect(response[0].asset_type).to.be.a('string');
      expect(response[0].asset_code).to.be.a('string');
      expect(response[0].asset_issuer).to.be.a('string');
      expect(response[0].paging_token).to.be.a('string');
      expect(response[0].amount).to.be.a('string');
      expect(response[0].num_accounts).to.be.a('integer');

      expect(response[0].flags).to.be.an('object');
      expect(response[0].flags.auth_required).to.be.a('boolean');
      expect(response[0].flags.auth_revocable).to.be.a('boolean');
      expect(response[0].flags.auth_immutable).to.be.a('boolean');

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
        .assets()
        .call();
    });
  });
});
