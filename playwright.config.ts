import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.test.ts',
  tsconfig: './tsconfig.json',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  outputDir: './test-results/playwright',
  reporter: 'list',
  timeout: 200000,
  expect: {
    toMatchSnapshot: {threshold: 0.2},
  },
  retries: process.env.CI ? 3 : 0,
});
