import { test as base, expect } from '@playwright/test'

const API_BASE_URL = process.env.API_BASE_URL ?? 'http://localhost:8000/api'

type TestFixtures = { cleanDb: void }

export const test = base.extend<TestFixtures>({
  cleanDb: [
    async ({ request }, use) => {
      const seedRes = await request.post(`${API_BASE_URL}/test/seed`)
      expect(seedRes.ok(), 'seed endpoint must succeed').toBeTruthy()

      await use()

      const cleanupRes = await request.post(`${API_BASE_URL}/test/cleanup`)
      expect(cleanupRes.ok(), 'cleanup endpoint must succeed').toBeTruthy()
    },
    { auto: true },
  ],
})

export { expect }
