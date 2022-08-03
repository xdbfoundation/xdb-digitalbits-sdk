/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemId = testConfig.ledgers.id;

describe('integration tests: effect for ledger', function() {
  this.timeout(50000);
   
  it('when requests effect for ledger than should return success response with effect', function(done) {
    const expectHandler = (response) => { 
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');

      if (response.records.length > 0) {
        expect(response.records[0].id).to.be.a('string');
        expect(response.records[0].account).to.be.a('string');
        expect(response.records[0].type).to.be.a('string');
      }
    
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .effects()
        .forLedger(itemId)
        .limit("1")
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
