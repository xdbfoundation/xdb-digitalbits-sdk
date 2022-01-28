/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemUsd = testConfig.assets.usd;
const destination_asset = new DigitalBitsSdk.Asset(itemUsd.currencyCode, itemUsd.id);
const destination_amount = "1";

describe('integration tests: paths strict recieve payment', function() {
  this.timeout(50000);
   
  it('when requests paths strict recieve payment than should return success response with paths strict recieve payment', function(done) {
    const expectHandler = (response) => {  
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');
      
      expect(response.records[0]).to.be.an('object');

      expect(response.records[0].source_asset_type).to.be.a('string');
      expect(response.records[0].source_amount).to.be.a('string');
      
      expect(response.records[0].destination_asset_type).to.be.a('string');
      expect(response.records[0].destination_asset_code).to.be.a('string');
      expect(response.records[0].destination_asset_issuer).to.be.a('string');
      expect(response.records[0].destination_amount).to.be.a('string');
      
      expect(response.records[0].path).to.be.a('array');
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .strictReceivePaths(
          [new DigitalBitsSdk.Asset.native()], 
          destination_asset, 
          destination_amount
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