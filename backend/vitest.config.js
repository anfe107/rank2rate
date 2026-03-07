import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000,
    passWithNoTests: true,
    env: {
      JWT_SECRET: 'test-jwt-secret-key-for-vitest-only',
      ENCRYPTION_KEY: '0000000000000000000000000000000000000000000000000000000000000000',
    },
  },
})
