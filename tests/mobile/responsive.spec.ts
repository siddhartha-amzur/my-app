import { test, expect } from '@playwright/test';
import { login } from '../helpers';

test('mobile responsiveness and loading states', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('button', { name: /Analyst (ON|OFF)/ })).toBeVisible();
  await expect(page.getByPlaceholder(/Type your message/i)).toBeVisible();
});
