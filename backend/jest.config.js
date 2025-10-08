/** @type {import('jest').Config} */
module.exports = {
  // TypeScript desteği
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Test dosyalarının yerleri
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  
  // Coverage ayarları
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!coverage/**',
    '!dist/**',
    '!node_modules/**'
  ],
  
  // Test setup dosyası
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  
  // TypeScript konfigürasyonu
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  
  // Module path mapping (tsconfig.json ile uyumlu)
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Test timeout (API testleri için)
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Coverage threshold
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
}; 