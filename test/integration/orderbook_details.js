/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;

const itemEurId = testConfig.assets.eur.id;
const itemUsdId = testConfig.assets.usd.id;

const itemEurCode = testConfig.assets.eur.currencyCode;
const itemUsdCode = testConfig.assets.usd.currencyCode;

describe('integration tests: orderbook details', function() {
  this.timeout(50000);
   
  it('when requests orderbook details than should return success response with orderbook details', function(done) {
    const expectHandler = (response) => {    
      expect(response).to.be.an('object');  

      expect(response.bids).to.be.an('array'); 
      expect(response.bids[0]).to.be.an('object');
      expect(response.bids[0].price_r).to.be.an('object');
      expect(response.bids[0].price_r.n).to.be.an('number');
      expect(response.bids[0].price_r.d).to.be.an('number');
      
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
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .orderbook(
          new DigitalBitsSdk.Asset(itemEurCode, itemEurId),
          new DigitalBitsSdk.Asset(itemUsdCode, itemUsdId)
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