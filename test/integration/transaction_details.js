/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemId = testConfig.transactions.id;

describe('integration tests: transaction details', function() {
  this.timeout(50000);
   
  it('when requests transaction details than should return success response with transaction details', function(done) {
    const expectHandler = (response) => {    
      expect(response).to.be.an('object');

      expect(response._links).to.be.an('object');
      expect(response._links.self.href).to.be.a('string');
      expect(response._links.account.href).to.be.a('string');
      expect(response._links.ledger.href).to.be.a('string');
      expect(response._links.operations.href).to.be.a('string');
      expect(response._links.effects.href).to.be.a('string');
      expect(response._links.precedes.href).to.be.a('string');
      expect(response._links.succeeds.href).to.be.a('string');
      expect(response._links.transaction.href).to.be.a('string');

      expect(response.id).to.be.a('string');
      expect(response.paging_token).to.be.a('string');
      expect(response.successful).to.be.a('boolean');
      expect(response.hash).to.be.a('string');

      expect(response.created_at).to.be.a('string');
      expect(response.source_account).to.be.a('string');
      expect(response.source_account_sequence).to.be.a('string');

      expect(response.fee_account).to.be.a('string');
      expect(response.fee_charged).to.be.a('string');
      expect(response.max_fee).to.be.a('string');
      expect(response.operation_count).to.be.a('number');

      expect(response.envelope_xdr).to.be.a('string');
      expect(response.result_xdr).to.be.a('string');
      expect(response.result_meta_xdr).to.be.a('string');
      expect(response.fee_meta_xdr).to.be.a('string');
      expect(response.memo_type).to.be.a('string');

      expect(response.signatures).to.be.an('array');
      expect(response.signatures[0]).to.be.a('string');

      expect(response.valid_after).to.be.a('string');
      expect(response.valid_before).to.be.a('string');
      expect(response.ledger_attr).to.be.a('number');
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .transactions()
        .transaction(itemId)
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