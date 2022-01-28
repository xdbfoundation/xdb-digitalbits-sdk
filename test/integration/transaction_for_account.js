/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;
const itemId = testConfig.accounts.sourcePublicKey;

describe('integration tests: transaction for account', function() {
  this.timeout(50000);
   
  it('when requests transaction for account than should return success response with transaction for account', function(done) {
    const expectHandler = (response) => {   
      expect(response).to.be.an('object');
      expect(response.records).to.be.an('array');

      expect(response.records[0]._links).to.be.an('object');
      expect(response.records[0]._links.self.href).to.be.a('string');
      expect(response.records[0]._links.account.href).to.be.a('string');
      expect(response.records[0]._links.ledger.href).to.be.a('string');
      expect(response.records[0]._links.operations.href).to.be.a('string');
      expect(response.records[0]._links.effects.href).to.be.a('string');
      expect(response.records[0]._links.precedes.href).to.be.a('string');
      expect(response.records[0]._links.succeeds.href).to.be.a('string');
      expect(response.records[0]._links.transaction.href).to.be.a('string');

      expect(response.records[0].id).to.be.a('string');
      expect(response.records[0].paging_token).to.be.a('string');
      expect(response.records[0].successful).to.be.a('boolean');
      expect(response.records[0].hash).to.be.a('string');

      expect(response.records[0].created_at).to.be.a('string');
      expect(response.records[0].source_account).to.be.a('string');
      expect(response.records[0].source_account_sequence).to.be.a('string');

      expect(response.records[0].fee_account).to.be.a('string');
      expect(response.records[0].fee_charged).to.be.a('string');
      expect(response.records[0].max_fee).to.be.a('string');
      expect(response.records[0].operation_count).to.be.a('number');

      expect(response.records[0].envelope_xdr).to.be.a('string');
      expect(response.records[0].result_xdr).to.be.a('string');
      expect(response.records[0].result_meta_xdr).to.be.a('string');
      expect(response.records[0].fee_meta_xdr).to.be.a('string');
      expect(response.records[0].memo_type).to.be.a('string');

      expect(response.records[0].signatures).to.be.an('array');
      expect(response.records[0].signatures[0]).to.be.a('string');

      expect(response.records[0].valid_after).to.be.a('string');
      //expect(response.records[0].valid_before).to.be.a('string');
      expect(response.records[0].ledger_attr).to.be.a('number');
     
      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .transactions()
        .forAccount(itemId)
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