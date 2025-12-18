module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  globalSetup: '<rootDir>/globalSetup.js',
  globalTeardown: '<rootDir>/globalTeardown.js',
};
