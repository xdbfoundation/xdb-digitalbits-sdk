/* eslint-disable */

const domainUrl = testConfig.general.domainUrl;

describe('integration tests: All Effects', function() {
  this.timeout(50000);
   
  it('when requests All Effects than should return success response with effects', function(done) {
    const expectHandler = (response) => { 
      expect(response.records).to.be.an('array');

      expect(response.records[0]).to.be.an('object');

      expect(response.records[0]._links).to.be.an('object');
      expect(response.records[0]._links.operation.href).to.be.a('string');
      expect(response.records[0]._links.succeeds.href).to.be.a('string');
      expect(response.records[0]._links.precedes.href).to.be.a('string');
      
      expect(response.records[0].id).to.be.a('string');
      expect(response.records[0].account).to.be.a('string');
      expect(response.records[0].type).to.be.a('string');

      done();
    };

    try {
      new DigitalBitsSdk.Server(`${domainUrl}`)
        .effects()
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
