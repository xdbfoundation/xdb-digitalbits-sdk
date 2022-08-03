/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;

describe('integration tests: All Ledgers', function() {
  this.timeout(50000);
   
  it('when requests All Ledgers than should return success response with ledgers', function(done) {
    const expectHandler = (response) => {
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');

      expect(response.records[0]).to.be.an('object');

      expect(response.records[0]._links).to.be.an('object');
      expect(response.records[0]._links.self.href).to.be.a('string');
      expect(response.records[0]._links.transactions.href).to.be.a('string');
      expect(response.records[0]._links.operations.href).to.be.a('string');
      expect(response.records[0]._links.payments.href).to.be.a('string');
      expect(response.records[0]._links.effects.href).to.be.a('string');

      expect(response.records[0].id).to.be.a('string');

      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .ledgers()
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
