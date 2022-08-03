/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemId = testConfig.transactions.id;

describe('integration tests: operation details', function() {
  this.timeout(50000);
   
  it('when requests operation details than should return success response with operation details', function(done) {
    let server;
    const itemId = '1099511631873'

    const expectHandler = (response) => {      
      expect(response).to.be.an('object');

      expect(response._links).to.be.an('object');
      expect(response._links.self.href).to.be.a('string');
      expect(response._links.transaction.href).to.be.a('string');
      expect(response._links.effects.href).to.be.a('string');
      expect(response._links.succeeds.href).to.be.a('string');
      expect(response._links.precedes.href).to.be.a('string');

      expect(response.id).to.be.a('string');

      expect(response.paging_token).to.be.a('string');
      expect(response.transaction_successful).to.be.a('boolean');
      expect(response.source_account).to.be.a('string');
      expect(response.type).to.be.a('string');
      expect(response.created_at).to.be.a('string');
      expect(response.transaction_hash).to.be.a('string');
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .operations()
        .operation(itemId)
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