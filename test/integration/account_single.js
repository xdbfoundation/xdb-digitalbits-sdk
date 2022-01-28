/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemId = testConfig.accounts.sourcePublicKey;

describe('integration tests: account single', function() {
  this.timeout(50000);

  it('when requests account single than should return success response with account single', function(done) {
    const expectHandler = (response) => {    
      expect(response).to.be.an('object');

      expect(response._links).to.be.an('object');
      expect(response._links.self.href).to.be.a('string');
      expect(response._links.transactions.href).to.be.a('string');
      expect(response._links.operations.href).to.be.a('string');
      expect(response._links.payments.href).to.be.a('string');
      expect(response._links.effects.href).to.be.a('string');
      
      expect(response.id).to.be.a('string');
      expect(response.account_id).to.be.a('string');
      expect(response.sequence).to.be.a('string');

      expect(response.balances[0].asset_type).to.be.a('string');
      expect(response.balances[0].balance).to.be.a('string');
      expect(response.balances[0].buying_liabilities).to.be.a('string');
      expect(response.balances[0].selling_liabilities).to.be.a('string');

      expect(response.flags).to.be.an('object');
      expect(response.flags.auth_required).to.be.a('boolean');
      expect(response.flags.auth_revocable).to.be.a('boolean');
      expect(response.flags.auth_immutable).to.be.a('boolean');

      expect(response.paging_token).to.be.a('string');

      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .accounts()
        .accountId(itemId)
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
