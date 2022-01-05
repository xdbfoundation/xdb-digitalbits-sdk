const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: orderbook details', function() {
   
  it('when requests orderbook details than should return success response with orderbook details', function(done) {
    let server;
    const itemIdEur = 'GDCIQQY2UKVNLLWGIX74DMTEAFCMQKAKYUWPBO7PLTHIHRKSFZN7V2FC'
    const itemIdUsd = 'GB4RZUSF3HZGCAKB3VBM2S7QOHHC5KTV3LLZXGBYR5ZO4B26CKHFZTSZ'

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);   
      expect(response).to.be.an('object');  

      expect(response.bids).to.be.an('array'); 
      expect(response.bids[0]).to.be.an('object');
      expect(response.bids[0].price_r).to.be.an('object');
      expect(response.bids[0].price_r.n).to.be.an('integer');
      expect(response.bids[0].price_r.d).to.be.an('integer');
      
      expect(response.bids[0].price).to.be.an('string');
      expect(response.bids[0].amount).to.be.an('string');

      expect(response.asks).to.be.an('array'); 

      expect(response.base).to.be.an('object');
      expect(response.base.asset_type).to.be.a('string');
      expect(response.base.asset_code).to.be.a('string');
      expect(response.base.asset_issuer).to.be.a('string');

      expect(response.counter).to.be.a('object');
      expect(response.counter.asset_type).to.be.a('string');
      expect(response.counter.asset_code).to.be.a('string');
      expect(response.counter.asset_issuer).to.be.a('string');
     
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
        .orderbook(
          new DigitalBitsSdk.Asset('EUR', itemIdEur),
          new DigitalBitsSdk.Asset('USD', itemIdUsd)
        )
        .call();
    });
  });
});
