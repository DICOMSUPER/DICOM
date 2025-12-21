/* eslint-disable */
import { readFileSync } from 'fs';
import { join } from 'path';

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(join(__dirname, '.spec.swcrc'), 'utf-8')
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

export default {
  displayName: '@backend/user-service-e2e',
  preset: '../../jest.preset.js',

  globalSetup: '<rootDir>/src/support/global-setup.ts',
  globalTeardown: '<rootDir>/src/support/global-teardown.ts',
  setupFiles: ['<rootDir>/src/support/test-setup.ts'],

  testEnvironment: 'node',

  transform: {
    '^.+\\.[tj]s$': ['@swc/jest', swcJestConfig],
  },

  moduleFileExtensions: ['ts', 'js', 'html'],

  // 🔥 BẮT BUỘC – FIX LỖI CANNOT FIND MODULE
  moduleNameMapper: {
    '^@user-service/(.*)$': '<rootDir>/../user-service/src/$1',
  },

  coverageDirectory: 'test-output/jest/coverage',
};
