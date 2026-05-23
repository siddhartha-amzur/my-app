import { expect, Page } from '@playwright/test';

export const TEST_EMAIL = process.env.E2E_EMAIL || 'qa@amzur.com';
export const TEST_PASSWORD = process.env.E2E_PASSWORD || 'password123';

export async function login(page: Page) {
  await page.goto('/login');
  await page.locator('input[type="email"]').first().fill(TEST_EMAIL);
  await page.locator('input[type="password"]').first().fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(/\/chat/, { timeout: 30_000 });
  await expect(page.getByText(/Conversations/i)).toBeVisible({ timeout: 30_000 });
}

export async function ensureNewChat(page: Page) {
  await page.getByRole('button', { name: /New Chat|\+/ }).first().click();
}

export async function sendMessage(page: Page, text: string) {
  const composer = page.getByPlaceholder(/Type your message/i).first();
  await composer.click();
  await composer.fill(text);
  const sendButton = page.getByRole('button').filter({ has: page.locator('text=/Send|Query|⏳|Analyzing/') }).last();
  await expect(sendButton).toBeEnabled({ timeout: 10_000 });
  await sendButton.click();
  try {
    await expect(composer).toHaveValue('', { timeout: 5_000 });
  } catch {
    // Mobile viewport can occasionally miss the button tap; Enter submits reliably.
    await composer.press('Enter');
    await expect(composer).toHaveValue('', { timeout: 10_000 });
  }
}
