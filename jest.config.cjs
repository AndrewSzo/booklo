const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  
  // Test only unit tests
  testMatch: [
    '<rootDir>/__tests__/unit/**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  
  // Ignore other test directories
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/ui/',
    '<rootDir>/__tests__/integration/',
    '<rootDir>/__tests__/e2e/',
    '<rootDir>/node_modules/',
    '<rootDir>/.next/'
  ],
  
  // Allure configuration
  testResultsProcessor: "jest-allure/dist/reporter"
}

module.exports = createJestConfig(customJestConfig) 