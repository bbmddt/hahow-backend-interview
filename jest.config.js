module.exports = {
  // The root of your source code, allows Jest to resolve imports correctly
  roots: ['<rootDir>/src'],

  // The test environment that will be used for testing
  testEnvironment: 'node',

  // A preset that is used as a base for Jest's configuration, for TypeScript
  preset: 'ts-jest',

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
};