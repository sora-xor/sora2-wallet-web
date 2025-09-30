module.exports = {
  env: {
    browser: true,
    mocha: true,
  },
  globals: {
    Cypress: 'readonly',
    cy: 'readonly',
    assert: 'readonly',
    expect: 'readonly',
  },
  rules: {
    strict: 'off',
  },
};
