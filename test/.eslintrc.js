module.exports = {
  env: {
    mocha: true,
    // "es6": true
  },
  globals: {
    DigitalBitsSdk: true,
    axios: true,
    chai: true,
    sinon: true,
    expect: true,
    FrontierAxiosClient: true
  },
  rules: {
    'no-unused-vars': 0
  }
};
