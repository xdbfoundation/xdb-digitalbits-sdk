/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemUsd = testConfig.assets.usd;
const itemEur = testConfig.assets.eur;

const source_asset = new DigitalBitsSdk.Asset(itemUsd.currencyCode, itemUsd.id);
const destination_asset = new DigitalBitsSdk.Asset(itemEur.currencyCode, itemEur.id);

const source_amount = "2";

describe('integration tests: paths strict send payment', function() {
  this.timeout(50000);
   
  it('when requests paths strict send payment than should return success response with paths strict send payment', function(done) {
    const expectHandler = (response) => {  
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
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .strictSendPaths(
          source_asset, 
          source_amount, 
          [destination_asset]
        )
        .call()        
        .then(function (response) {
          //console.log('response',JSON.stringify(response));
          expectHandler(response)          
        })
        .catch(function (err) {
          console.error(err);
        });
    } catch (e) {
      console.log('An error has occured:');
      
      console.log(e);
      console.log('e.response.data.extras',e.response.data.extras);
    }
  });
});