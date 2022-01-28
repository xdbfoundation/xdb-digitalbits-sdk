/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const usdObj = testConfig.assets.usd;

const base = new DigitalBitsSdk.Asset.native();
const counter = new DigitalBitsSdk.Asset(usdObj.currencyCode, usdObj.id);
const startTime = 1623920055000;
const endTime = 1623937426000;
const resolution = 60000;
const offset = 0;

describe('integration tests: trades for account', function() {
  this.timeout(50000);
   
  it('when requests trades for account than should return success response with trades for account', function(done) {
    const expectHandler = (response) => {
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
      expect(response.records[0].high_r.N).to.be.a('number');
      expect(response.records[0].high_r.D).to.be.a('number');

      expect(response.records[0].low).to.be.a('string');
      expect(response.records[0].low_r).to.be.a('object');
      expect(response.records[0].low_r.N).to.be.a('number');
      expect(response.records[0].low_r.D).to.be.a('number');

      expect(response.records[0].open).to.be.a('string');
      expect(response.records[0].open_r).to.be.a('object');
      expect(response.records[0].open_r.N).to.be.a('number');
      expect(response.records[0].open_r.D).to.be.a('number');

      expect(response.records[0].close).to.be.a('string');
      expect(response.records[0].close_r).to.be.a('object');
      expect(response.records[0].close_r.N).to.be.a('number');
      expect(response.records[0].close_r.D).to.be.a('number');
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .tradeAggregation(base, counter, startTime, endTime, resolution, offset)
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