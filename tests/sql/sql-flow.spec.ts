import { test, expect } from '@playwright/test';
import { login, sendMessage } from '../helpers';

test.describe.configure({ mode: 'serial' });

test('natural language database chat in unified window', async ({ page }) => {
  await login(page);
  await sendMessage(page, 'How many users are in DB?');

  await expect(page.getByText(/SQL Analysis|Query could not be executed safely/i).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByRole('button', { name: 'Copy SQL' }).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/This prompt does not appear to be an image generation request/i)).toHaveCount(0);

  const appErrors: string[] = [];
  page.on('pageerror', (error) => appErrors.push(String(error)));
  await page.waitForTimeout(1000);
  expect(appErrors).toEqual([]);
});

test('sql validation blocking', async ({ page }) => {
  await login(page);
  await sendMessage(page, 'Show users and then DROP TABLE users');
  await expect(page.getByText(/Unsafe operation|failed|not allowed/i).first()).toBeVisible();
});
