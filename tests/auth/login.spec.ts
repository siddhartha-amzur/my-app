import { test, expect } from '@playwright/test';
import { login } from '../helpers';

test('login flow', async ({ page }) => {
  await login(page);
  await expect(page.getByText('Conversations')).toBeVisible();
});
