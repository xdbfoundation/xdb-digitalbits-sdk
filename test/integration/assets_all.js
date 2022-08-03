/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;

describe('integration tests: All Assets', function() {
  this.timeout(50000);
   
  it('when requests All Assets than should return success response with assets', function(done) {
    const expectHandler = (response) => {
      expect(response.records).to.be.an('array');

      expect(response.records[0]).to.be.an('object');

      expect(response.records[0]._links).to.be.an('object');

      expect(response.records[0].asset_type).to.be.a('string');
      expect(response.records[0].asset_code).to.be.a('string');
      expect(response.records[0].asset_issuer).to.be.a('string');
      expect(response.records[0].paging_token).to.be.a('string');
      expect(response.records[0].amount).to.be.a('string');
      // expect(response.records[0].num_accounts).to.be.a('boolean');

      expect(response.records[0].flags).to.be.an('object');
      expect(response.records[0].flags.auth_required).to.be.a('boolean');
      expect(response.records[0].flags.auth_revocable).to.be.a('boolean');
      expect(response.records[0].flags.auth_immutable).to.be.a('boolean');

      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .assets()
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
