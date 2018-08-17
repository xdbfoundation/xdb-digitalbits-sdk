import http from "http";

describe("digitalbits_toml_resolver.js tests", function () {
  beforeEach(function () {
    this.axiosMock = sinon.mock(axios);
    DigitalBitsSdk.Config.setDefault();
  });

  afterEach(function () {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe('DigitalBitsTomlResolver.resolve', function () {
    it("returns digitalbits.toml object for valid request and digitalbits.toml file", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://acme.com/.well-known/digitalbits.toml'))
        .returns(Promise.resolve({
          data: `
#   The endpoint which clients should query to resolve digitalbits addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`
        }));

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve('acme.com')
        .then(digitalbitsToml => {
          expect(digitalbitsToml.FEDERATION_SERVER).equals('https://api.stellar.org/federation');
          done();
        });
    });

    it("returns digitalbits.toml object for valid request and digitalbits.toml file when allowHttp is `true`", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('http://acme.com/.well-known/digitalbits.toml'))
        .returns(Promise.resolve({
          data: `
#   The endpoint which clients should query to resolve digitalbits addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`
        }));

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve('acme.com', {allowHttp: true})
        .then(digitalbitsToml => {
          expect(digitalbitsToml.FEDERATION_SERVER).equals('http://api.stellar.org/federation');
          done();
        });
    });

    it("returns digitalbits.toml object for valid request and digitalbits.toml file when global Config.allowHttp flag is set", function (done) {
      DigitalBitsSdk.Config.setAllowHttp(true);

      this.axiosMock.expects('get')
        .withArgs(sinon.match('http://acme.com/.well-known/digitalbits.toml'))
        .returns(Promise.resolve({
          data: `
#   The endpoint which clients should query to resolve digitalbits addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.stellar.org/federation"
`
        }));

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve('acme.com')
        .then(digitalbitsToml => {
          expect(digitalbitsToml.FEDERATION_SERVER).equals('http://api.stellar.org/federation');
          done();
        });
    });

    it("rejects when digitalbits.toml file is invalid", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://acme.com/.well-known/digitalbits.toml'))
        .returns(Promise.resolve({
          data: `
/#   The endpoint which clients should query to resolve digitalbits addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.stellar.org/federation"
`
        }));

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve('acme.com').should.be.rejectedWith(/Parsing error on line/).and.notify(done);
    });

    it("rejects when there was a connection error", function (done) {
      this.axiosMock.expects('get')
        .withArgs(sinon.match('https://acme.com/.well-known/digitalbits.toml'))
        .returns(Promise.reject());

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve('acme.com').should.be.rejected.and.notify(done);
    });

    it("fails when response exceeds the limit", function (done) {
      // Unable to create temp server in a browser
      if (typeof window != 'undefined') {
        return done();
      }
      var response = Array(DigitalBitsSdk.DIGITALBITS_TOML_MAX_SIZE+10).join('a');
      let tempServer = http.createServer((req, res) => {
        res.setHeader('Content-Type', 'text/x-toml; charset=UTF-8');
        res.end(response);
      }).listen(4444, () => {
        DigitalBitsSdk.DigitalBitsTomlResolver.resolve("localhost:4444", {allowHttp: true})
          .should.be.rejectedWith(/digitalbits.toml file exceeds allowed size of [0-9]+/)
          .notify(done)
          .then(() => tempServer.close());
      });
    });
  });
});
