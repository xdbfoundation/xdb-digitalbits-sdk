/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemId = testConfig.assets.usd.fullId;

describe('integration tests: All accounts', function() {
  this.timeout(50000);
   
  it('when requests All accounts than should return success response with accounts', function(done) {
    const expectHandler = (response) => { 
      expect(response.records).to.be.an('array');

      expect(response.records[0]).to.be.an('object');

      expect(response.records[0]._links).to.be.an('object');
      expect(response.records[0]._links.self.href).to.be.a('string');
      expect(response.records[0]._links.transactions.href).to.be.a('string');
      expect(response.records[0]._links.operations.href).to.be.a('string');
      expect(response.records[0]._links.payments.href).to.be.a('string');
      expect(response.records[0]._links.effects.href).to.be.a('string');

      expect(response.records[0].balances[0].asset_type).to.be.a('string');
      expect(response.records[0].balances[0].balance).to.be.a('string');
      expect(response.records[0].balances[0].buying_liabilities).to.be.a('string');
      expect(response.records[0].balances[0].selling_liabilities).to.be.a('string');

      expect(response.records[0].flags).to.be.an('object');
      expect(response.records[0].flags.auth_required).to.be.a('boolean');
      expect(response.records[0].flags.auth_revocable).to.be.a('boolean');
      expect(response.records[0].flags.auth_immutable).to.be.a('boolean');

      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .accounts()
        .forAsset(itemId)
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
