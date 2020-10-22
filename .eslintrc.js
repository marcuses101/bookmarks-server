module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  "standard": {"env":["mocha"]},
  globals: {
    supertest: true,
    expect: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {}
};
