const http = require("http");
const url = require("url");
const port = 8000;

describe('integration tests: paths strict send payment', function() {
   
  it('when requests paths strict send payment than should return success response with paths strict send payment', function(done) {
    let server;
    const itemIdUsd = 'GB4RZUSF3HZGCAKB3VBM2S7QOHHC5KTV3LLZXGBYR5ZO4B26CKHFZTSZ'
    const itemIdEur = 'GDCIQQY2UKVNLLWGIX74DMTEAFCMQKAKYUWPBO7PLTHIHRKSFZN7V2FC'
    const source_asset = new DigitalBitsSdk.Asset('USD', itemIdUsd);
    const destination_asset = new DigitalBitsSdk.Asset('EUR', itemIdEur);
    const source_amount = "2";

    const requestHandler = (request, response) => {
      expect(request.headers["x-client-name"]).to.be.equal("xdb-digitalbits-sdk");
      expect(request.headers["x-client-version"]).to.match(
        /^[0-9]+\.[0-9]+\.[0-9]+(-[a-z]+(\.[0-9])?)?$/
      );

      expect(response).to.have.status(200);   
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');
      
      expect(response.records[0]).to.be.an('object');

      expect(response.records[0].source_asset_type).to.be.a('string');
      expect(response.records[0].source_asset_code).to.be.a('string');
      expect(response.records[0].source_asset_issuer).to.be.a('string');
      expect(response.records[0].source_amount).to.be.a('string');

      expect(response.records[0].destination_asset_type).to.be.a('string');
      expect(response.records[0].destination_asset_code).to.be.a('string');
      expect(response.records[0].destination_asset_issuer).to.be.a('string');
      expect(response.records[0].destination_amount).to.be.a('string');
      
      expect(response.records[0].path).to.be.a('array');
      expect(response.records[0].path[0].asset_type).to.be.a('string');
      expect(response.records[0].path[0].asset_code).to.be.a('string');
      expect(response.records[0].path[0].asset_issuer).to.be.a('string');
     
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
        .strictSendPaths(
          source_asset, 
          source_amount, 
          [destination_asset]
        )
        .call();
    });
  });
});
