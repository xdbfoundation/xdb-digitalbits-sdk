module.exports = {
  env: {
    node: true
  },
  extends: ['eslint:recommended', 'plugin:node/recommended', '@digitalbits-blockchain/eslint-config'],
  rules: {
    'node/no-unpublished-require': 0
  }
};
