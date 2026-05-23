import { test, expect, Page } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { login } from '../helpers';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function expectUploadRequestHandled(page: Page) {
  const response = await page.waitForResponse(
    (resp) => resp.url().includes('/api/data-sources/upload') && resp.request().method() === 'POST',
    { timeout: 30_000 },
  );
  expect(response.status(), 'Upload API should be handled without a server crash').toBeLessThan(500);
}

test('excel upload flow', async ({ page }) => {
  await login(page);
  const filePath = path.resolve(__dirname, '../../..', 'ai_forge_backend', 'uploads', 'documents', 'not_a_pdf.txt');
  const uploadHandled = expectUploadRequestHandled(page);
  await page.setInputFiles('input[type="file"][accept=".csv,.xlsx"]', filePath);
  await uploadHandled;
});

test('csv upload flow', async ({ page }) => {
  await login(page);
  const filePath = path.resolve(__dirname, '../../..', 'test_attachment.txt');
  const uploadHandled = expectUploadRequestHandled(page);
  await page.setInputFiles('input[type="file"][accept=".csv,.xlsx"]', filePath);
  await uploadHandled;
});
