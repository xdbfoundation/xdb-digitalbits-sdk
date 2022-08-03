/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemId = testConfig.ledgers.id;

describe('integration tests: Ledger single', function() {
  this.timeout(50000);
   
  it('when requests single Ledger than should return success response with single ledger', function(done) {
    const expectHandler = (response) => {    
      expect(response).to.be.an('object');

      expect(response._links).to.be.an('object');
      expect(response._links.self.href).to.be.a('string');
      expect(response._links.transactions.href).to.be.a('string');
      expect(response._links.operations.href).to.be.a('string');
      expect(response._links.payments.href).to.be.a('string');
      expect(response._links.effects.href).to.be.a('string');

      expect(response.id).to.be.a('string');
      expect(response.total_coins).to.be.a('string');
      expect(response.fee_pool).to.be.a('string');
      //expect(response.base_fee_in_nibbs).to.be.a('number');
      expect(response.base_reserve_in_stroops).to.be.a('number');
      expect(response.max_tx_set_size).to.be.a('number');
      expect(response.protocol_version).to.be.a('number');

      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .ledgers()
        .ledger(itemId)
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