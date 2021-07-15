const http = require('http');

describe('digitalbits_toml_resolver.js tests', function() {
  beforeEach(function() {
    this.axiosMock = sinon.mock(axios);
    DigitalBitsSdk.Config.setDefault();
  });

  afterEach(function() {
    this.axiosMock.verify();
    this.axiosMock.restore();
  });

  describe('DigitalBitsTomlResolver.resolve', function() {
    afterEach(function() {
      DigitalBitsSdk.Config.setDefault();
    });

    it('returns digitalbits.toml object for valid request and digitalbits.toml file', function(done) {
      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('https://livenet.digitalbits.io/.well-known/digitalbits.toml'))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve DigitalBits addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.livenet.digitalbits.io/federation"
`
          })
        );

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve('livenet.digitalbits.io').then((digitalBitsToml) => {
        expect(digitalBitsToml.FEDERATION_SERVER).equals(
          'https://api.livenet.digitalbits.io/federation'
        );
        done();
      });
    });

    it('returns digitalbits.toml object for valid request and digitalbits.toml file when allowHttp is `true`', function(done) {
      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('http://livenet.digitalbits.io/.well-known/digitalbits.toml'))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve DigitalBits addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.livenet.digitalbits.io/federation"
`
          })
        );

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve('livenet.digitalbits.io', {
        allowHttp: true
      }).then((digitalBitsToml) => {
        expect(digitalBitsToml.FEDERATION_SERVER).equals(
          'http://api.livenet.digitalbits.io/federation'
        );
        done();
      });
    });

    it('returns digitalbits.toml object for valid request and digitalbits.toml file when global Config.allowHttp flag is set', function(done) {
      DigitalBitsSdk.Config.setAllowHttp(true);

      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('http://livenet.digitalbits.io/.well-known/digitalbits.toml'))
        .returns(
          Promise.resolve({
            data: `
#   The endpoint which clients should query to resolve DigitalBits addresses
#   for users on your domain.
FEDERATION_SERVER="http://api.livenet.digitalbits.io/federation"
`
          })
        );

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve('livenet.digitalbits.io').then((digitalBitsToml) => {
        expect(digitalBitsToml.FEDERATION_SERVER).equals(
          'http://api.livenet.digitalbits.io/federation'
        );
        done();
      });
    });

    it('rejects when digitalbits.toml file is invalid', function(done) {
      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('https://livenet.digitalbits.io/.well-known/digitalbits.toml'))
        .returns(
          Promise.resolve({
            data: `
/#   The endpoint which clients should query to resolve DigitalBits addresses
#   for users on your domain.
FEDERATION_SERVER="https://api.livenet.digitalbits.io/federation"
`
          })
        );

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve('livenet.digitalbits.io')
        .should.be.rejectedWith(/Parsing error on line/)
        .and.notify(done);
    });

    it('rejects when there was a connection error', function(done) {
      this.axiosMock
        .expects('get')
        .withArgs(sinon.match('https://livenet.digitalbits.io/.well-known/digitalbits.toml'))
        .returns(Promise.reject());

      DigitalBitsSdk.DigitalBitsTomlResolver.resolve(
        'livenet.digitalbits.io'
      ).should.be.rejected.and.notify(done);
    });

    it('fails when response exceeds the limit', function(done) {
      // Unable to create temp server in a browser
      if (typeof window != 'undefined') {
        return done();
      }
      var response = Array(DigitalBitsSdk.DIGITALBITS_TOML_MAX_SIZE + 10).join('a');
      let tempServer = http
        .createServer((req, res) => {
          res.setHeader('Content-Type', 'text/x-toml; charset=UTF-8');
          res.end(response);
        })
        .listen(4444, () => {
          DigitalBitsSdk.DigitalBitsTomlResolver.resolve('localhost:4444', {
            allowHttp: true
          })
            .should.be.rejectedWith(
              /digitalbits.toml file exceeds allowed size of [0-9]+/
            )
            .notify(done)
            .then(() => tempServer.close());
        });
    });

    it('rejects after given timeout when global Config.timeout flag is set', function(done) {
      DigitalBitsSdk.Config.setTimeout(1000);

      // Unable to create temp server in a browser
      if (typeof window != 'undefined') {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444, () => {
          DigitalBitsSdk.DigitalBitsTomlResolver.resolve('localhost:4444', {
            allowHttp: true
          })
            .should.be.rejectedWith(/timeout of 1000ms exceeded/)
            .notify(done)
            .then(() => {
              DigitalBitsSdk.Config.setDefault();
              tempServer.close();
            });
        });
    });

    it('rejects after given timeout when timeout specified in DigitalBitsTomlResolver opts param', function(done) {
      // Unable to create temp server in a browser
      if (typeof window != 'undefined') {
        return done();
      }

      let tempServer = http
        .createServer((req, res) => {
          setTimeout(() => {}, 10000);
        })
        .listen(4444, () => {
          DigitalBitsSdk.DigitalBitsTomlResolver.resolve('localhost:4444', {
            allowHttp: true,
            timeout: 1000
          })
            .should.be.rejectedWith(/timeout of 1000ms exceeded/)
            .notify(done)
            .then(() => tempServer.close());
        });
    });
  });
});
