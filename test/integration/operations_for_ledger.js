/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemId = testConfig.ledgers.id;

describe('integration tests: operations for ledger', function() {
  this.timeout(50000);
   
  it('when requests operations for ledger than should return success response with operations for ledger', function(done) {
    const expectHandler = (response) => {  
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');

      if (response.records.length > 0) {
        expect(response.records[0]).to.be.an('object');

        expect(response.records[0]._links).to.be.an('object');
        expect(response.records[0]._links.self.href).to.be.a('string');
        expect(response.records[0]._links.transaction.href).to.be.a('string');
        expect(response.records[0]._links.effects.href).to.be.a('string');
        expect(response.records[0]._links.succeeds.href).to.be.a('string');
        expect(response.records[0]._links.precedes.href).to.be.a('string');
  
        expect(response.records[0].id).to.be.a('string');
  
        expect(response.records[0].paging_token).to.be.a('string');
        expect(response.records[0].transaction_successful).to.be.a('boolean');
        expect(response.records[0].source_account).to.be.a('string');
        expect(response.records[0].type).to.be.a('string');
        expect(response.records[0].created_at).to.be.a('string');
        expect(response.records[0].transaction_hash).to.be.a('string');
      }      
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .operations()
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