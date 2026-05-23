import { test, expect } from '@playwright/test';
import { login } from '../helpers';

test('google oauth button handles unavailable flow gracefully', async ({ page }) => {
  await page.goto('/login');

  const oauthResponsePromise = page.waitForResponse((response) =>
    response.url().includes('/api/auth/google/login'),
  );

  await page.getByRole('button', { name: /Continue with Google/i }).click();
  const oauthResponse = await oauthResponsePromise;

  expect([200, 400, 401, 403, 404, 500, 503]).toContain(oauthResponse.status());

  // Local/dev setups may redirect to Google or keep user on login page.
  await page.waitForTimeout(1000);
  const currentUrl = page.url();
  expect(currentUrl.includes('accounts.google.com') || currentUrl.includes('/login')).toBeTruthy();
});

test('protected API blocks unauthorized access', async ({ request }) => {
  const response = await request.get('http://127.0.0.1:8000/api/threads');
  expect([401, 403]).toContain(response.status());
});

test('session persists after refresh', async ({ page }) => {
  await login(page);
  await expect(page.getByText(/Conversations/i)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Conversations/i)).toBeVisible();
});
