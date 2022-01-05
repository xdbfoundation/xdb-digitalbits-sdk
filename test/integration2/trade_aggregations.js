const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: trades for account', function() {
   
  it('when requests trades for account than should return success response with trades for account', function(done) {
    let server;
    const base = new DigitalBitsSdk.Asset.native();
    const counter = new DigitalBitsSdk.Asset("USD", "GB4RZUSF3HZGCAKB3VBM2S7QOHHC5KTV3LLZXGBYR5ZO4B26CKHFZTSZ");
    const startTime = 1623920055000;
    const endTime = 1623937426000;
    const resolution = 60000;
    const offset = 0;

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');

      expect(response.records[0]).to.be.an('object');

      expect(response.records[0].timestamp).to.be.a('string');
      expect(response.records[0].trade_count).to.be.a('string');
      expect(response.records[0].base_volume).to.be.a('string');

      expect(response.records[0].counter_volume).to.be.a('string');
      expect(response.records[0].avg).to.be.a('string');

      expect(response.records[0].high).to.be.a('string');
      expect(response.records[0].high_r).to.be.a('object');
      expect(response.records[0].high_r).to.be.a('object');
      expect(response.records[0].high_r.N).to.be.a('integer');
      expect(response.records[0].high_r.D).to.be.a('integer');

      expect(response.records[0].low).to.be.a('string');
      expect(response.records[0].low_r).to.be.a('object');
      expect(response.records[0].low_r.N).to.be.a('integer');
      expect(response.records[0].low_r.D).to.be.a('integer');

      expect(response.records[0].open).to.be.a('string');
      expect(response.records[0].open_r).to.be.a('object');
      expect(response.records[0].open_r.N).to.be.a('integer');
      expect(response.records[0].open_r.D).to.be.a('integer');

      expect(response.records[0].close).to.be.a('string');
      expect(response.records[0].close_r).to.be.a('object');
      expect(response.records[0].close_r.N).to.be.a('integer');
      expect(response.records[0].close_r.D).to.be.a('integer');
     
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
        .tradeAggregation(base, counter, startTime, endTime, resolution, offset)
        .call();
    });
  });
});
