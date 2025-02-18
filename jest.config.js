export default {
    testTimeout: 30000,
    verbose: true,
    detectOpenHandles: true,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    globalTeardown: '<rootDir>/jest.teardown.js',
    transform: {
      "^.+\\.(t|j)sx?$": "@swc/jest"
    },
  };