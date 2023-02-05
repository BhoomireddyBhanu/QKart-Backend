// Configuration file for testing
// Find configuration options listed here - https://jestjs.io/docs/en/configuration
module.exports = {
  testEnvironment: "node",
  // Overwrite the "NODE_ENV" variable when running tests
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  restoreMocks: true,
};
