import { test, expect } from '@playwright/test';
import { login } from '../helpers';

test('frontend console should not contain uncaught errors on chat load', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(String(error)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await login(page);
  await page.waitForTimeout(1000);

  const filtered = errors.filter((entry) => !entry.includes('favicon'));
  expect(filtered).toEqual([]);
});
