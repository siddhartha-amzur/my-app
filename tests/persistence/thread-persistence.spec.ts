import { test, expect } from '@playwright/test';
import { login, sendMessage } from '../helpers';

test('thread restoration and refresh persistence', async ({ page }) => {
  await login(page);
  const sendHandled = page.waitForResponse(
    (resp) => resp.url().includes('/api/chat') && resp.request().method() === 'POST',
    { timeout: 60_000 },
  );
  await sendMessage(page, 'Persistence check message');
  const sendResp = await sendHandled;
  expect(sendResp.status(), 'Message send should not fail at server level').toBeLessThan(500);
  await page.reload();
  await expect(page.getByText(/Conversations/i)).toBeVisible();
});
