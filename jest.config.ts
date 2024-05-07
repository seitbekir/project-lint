import type { JestConfigWithTsJest } from 'ts-jest';

const jestConfig: JestConfigWithTsJest = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  globals: { NODE_ENV: 'test' },
  clearMocks: true,
  testTimeout: 10000,
  moduleNameMapper: {
    '@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['<rootDir>/src/**/__tests__/*.ts'],
  coverageReporters: ['lcov', 'text'],
};

export default jestConfig;
