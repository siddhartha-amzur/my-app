import { test, expect } from '@playwright/test';
import { login } from '../helpers';

test('google sheet flow validation', async ({ page }) => {
  await login(page);
  await page.getByPlaceholder(/Google Sheet URL/i).first().fill('https://docs.google.com/spreadsheets/d/invalid-sheet-id/edit#gid=0');
  await page.getByRole('button', { name: 'Connect' }).click();
  await expect(page.getByText(/invalid|private|failed|sheet/i)).toBeVisible();
});
