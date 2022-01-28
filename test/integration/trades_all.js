/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;

describe('integration tests: All Offers', function() {
  this.timeout(50000);
   
  it('when requests All Offers than should return success response with Offers', function(done) {
    const expectHandler = (response) => {
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');
      
      expect(response.records[0]).to.be.an('object');

      expect(response.records[0]._links).to.be.an('object');
      expect(response.records[0]._links.self.href).to.be.a('string');
      expect(response.records[0]._links.base.href).to.be.a('string');
      expect(response.records[0]._links.counter.href).to.be.a('string');
      expect(response.records[0]._links.operation.href).to.be.a('string');

      expect(response.records[0].id).to.be.a('string');
      expect(response.records[0].ledger_close_time).to.be.a('string');
      expect(response.records[0].offer_id).to.be.a('string');

      expect(response.records[0].base_offer_id).to.be.a('string');
      expect(response.records[0].base_account).to.be.a('string');
      expect(response.records[0].base_amount).to.be.a('string');
      expect(response.records[0].base_asset_type).to.be.a('string');

      expect(response.records[0].counter_offer_id).to.be.a('string');
      expect(response.records[0].counter_account).to.be.a('string');
      expect(response.records[0].counter_amount).to.be.a('string');
      expect(response.records[0].counter_asset_type).to.be.a('string');
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .trades()
        .limit("2")
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
