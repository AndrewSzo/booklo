import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Coverage settings
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'app/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/*.config.{js,ts}',
    '!**/types.ts',
  ],
  
  // Coverage thresholds based on test plan
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80
    },
    // Critical areas require higher coverage per test plan
    './components/auth/**/*.{js,jsx,ts,tsx}': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './app/api/**/*.{js,jsx,ts,tsx}': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).{js,jsx,ts,tsx}',
    '**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  
  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/**/*.(test|spec).{js,jsx,ts,tsx}'],
      testPathIgnorePatterns: ['<rootDir>/__tests__/e2e/', '<rootDir>/__tests__/integration/']
    },
    {
      displayName: 'ui', 
      testMatch: ['<rootDir>/__tests__/ui/**/*.(test|spec).{js,jsx,ts,tsx}']
    }
  ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig) 