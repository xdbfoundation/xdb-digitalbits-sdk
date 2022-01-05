const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: Ledger single', function() {
   
  it('when requests single Ledger than should return success response with single ledger', function(done) {
    let server;
    const itemId = '577555'

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);
      expect(response).to.be.an('object');

      expect(response._links).to.be.an('object');
      expect(response.self.href).to.be.a('string');
      expect(response.transactions.href).to.be.a('string');
      expect(response.operations.href).to.be.a('string');
      expect(response.payments.href).to.be.a('string');
      expect(response.effects.href).to.be.a('string');

      expect(response.id).to.be.a('string');
      expect(response.total_coins).to.be.a('string');
      expect(response.fee_pool).to.be.a('string');
      expect(response.base_fee_in_nibbs).to.be.a('integer');
      expect(response.base_reserve_in_nibbs).to.be.a('integer');
      expect(response.max_tx_set_size).to.be.a('integer');
      expect(response.protocol_version).to.be.a('integer');

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
        .ledger(itemId)
        .call();
    });
  });
});
