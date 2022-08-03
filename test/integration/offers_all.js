/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemId = testConfig.accounts.sourcePublicKey;

describe('integration tests: All Offers', function() {
  this.timeout(50000);
   
  it('when requests All Offers than should return success response with Offers', function(done) {
    const expectHandler = (response) => {
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');

      expect(response.records[0]).to.be.an('object');

      expect(response.records[0]._links).to.be.an('object');
      expect(response.records[0]._links.self.href).to.be.a('string');
      expect(response.records[0]._links.offer_maker.href).to.be.a('string');

      expect(response.records[0].id).to.be.a('string');

      expect(response.records[0].seller).to.be.a('string');
      expect(response.records[0].selling).to.be.an('object');
      expect(response.records[0].selling.asset_type).to.be.a('string');
      expect(response.records[0].selling.asset_code).to.be.a('string');
      expect(response.records[0].selling.asset_issuer).to.be.a('string');

      expect(response.records[0].buying).to.be.an('object');
      expect(response.records[0].buying.asset_type).to.be.a('string');
      //expect(response.records[0].buying.asset_code).to.be.a('string');
      //expect(response.records[0].buying.asset_issuer).to.be.a('string');

      expect(response.records[0].amount).to.be.a('string');
      expect(response.records[0].price).to.be.a('string');

      expect(response.records[0].last_modified_ledger).to.be.a('number');
      expect(response.records[0].last_modified_time).to.be.a('string');
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .offers('accounts', itemId)
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
