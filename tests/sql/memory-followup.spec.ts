import { test, expect } from '@playwright/test';
import { login, sendMessage } from '../helpers';

test.describe.configure({ mode: 'serial' });

test('memory follow-up question in unified sql chat', async ({ page }) => {
  await login(page);
  await sendMessage(page, 'Show top customers');
  await sendMessage(page, 'Now only from Texas');
  await expect(page.getByText(/SQL Analysis|No results found|summary|Query could not be executed safely/i).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(/Now only from Texas/i)).toBeVisible({ timeout: 30_000 });
});
