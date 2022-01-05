const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: All Offers', function() {
   
  it('when requests All Offers than should return success response with Offers', function(done) {
    let server;
    const itemId = 'GDFOHLMYCXVZD2CDXZLMW6W6TMU4YO27XFF2IBAFAV66MSTPDDSK2LAY'

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);
      expect(response).to.be.an('array');

      expect(response).to.be.an('object');

      expect(response[0]._links).to.be.an('object');
      expect(response[0]._links.self.href).to.be.a('string');
      expect(response[0]._links.base.href).to.be.a('string');
      expect(response[0]._links.counter.href).to.be.a('string');
      expect(response[0]._links.operation.href).to.be.a('string');

      expect(response[0].id).to.be.a('string');
      expect(response[0].ledger_close_time).to.be.a('string');
      expect(response[0].offer_id).to.be.a('string');

      expect(response[0].base_offer_id).to.be.a('string');
      expect(response[0].base_account).to.be.a('string');
      expect(response[0].base_amount).to.be.a('string');
      expect(response[0].base_asset_type).to.be.a('string');

      expect(response[0].counter_offer_id).to.be.a('string');
      expect(response[0].counter_account).to.be.a('string');
      expect(response[0].counter_amount).to.be.a('string');
      expect(response[0].counter_asset_type).to.be.a('string');
     
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
        .trades()
        .call();
    });
  });
});
