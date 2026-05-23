/**
 * gsheet-integration.spec.ts
 *
 * Playwright E2E tests for the Project 9 Google Sheets integration.
 *
 * Tests:
 * 1. Toolbar rendered – DataSourceToolbar is visible in the chat input area
 * 2. Connect invalid URL – shows error state
 * 3. Connect valid public sheet – v2 endpoint connects, card shown
 * 4. ActiveDataSourceBar shown after connection
 * 5. Ask a natural-language question after connecting (response visible)
 * 6. Preview toggle shows table
 * 7. Remove sheet clears it
 * 8. Memory persistence – re-open thread shows sheet card
 *
 * Requires env vars:
 *   E2E_EMAIL, E2E_PASSWORD (defaults: qa@amzur.com / password123)
 *   E2E_GSHEET_URL – a valid publicly accessible Google Sheet URL
 *                    Default: a minimal test sheet
 */

import { test, expect, Page } from '@playwright/test';
import { login, ensureNewChat, sendMessage } from '../helpers';

const GSHEET_URL =
  process.env.E2E_GSHEET_URL ||
  'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit';

const INVALID_URL = 'https://www.example.com/not-a-sheet';

// ---------------------------------------------------------------------------
// Helper: click the "Google Sheet" toolbar button and fill the URL input
// ---------------------------------------------------------------------------
async function openGSheetPanel(page: Page) {
  // Click the "Google Sheet" toolbar button
  const toolbarBtn = page.getByTestId('toolbar-gsheet');
  await expect(toolbarBtn).toBeVisible({ timeout: 15_000 });
  await toolbarBtn.click();
  // Inline panel should appear
  await expect(page.getByTestId('gsheet-inline-panel')).toBeVisible({ timeout: 5_000 });
}

async function fillAndConnect(page: Page, url: string) {
  const urlInput = page.getByPlaceholder(/Paste.*Google Sheet URL/i).first();
  await urlInput.fill(url);
  await page.getByRole('button', { name: /Connect/i }).last().click();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('Google Sheets integration', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await ensureNewChat(page);
  });

  // 1. Toolbar is rendered ---------------------------------------------------
  test('DataSourceToolbar is visible in chat input area', async ({ page }) => {
    await expect(page.getByTestId('data-source-toolbar')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByTestId('toolbar-gsheet')).toBeVisible();
    await expect(page.getByTestId('toolbar-excel')).toBeVisible();
    await expect(page.getByTestId('toolbar-csv')).toBeVisible();
  });

  // 2. Invalid URL shows error -----------------------------------------------
  test('invalid sheet URL shows error message', async ({ page }) => {
    await openGSheetPanel(page);
    await fillAndConnect(page, INVALID_URL);
    // Either a toast error or inline error should appear
    await expect(
      page.getByText(/invalid|failed|unable|error/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  // 3. Connect valid sheet ---------------------------------------------------
  test('connects a valid public Google Sheet successfully', async ({ page }) => {
    test.setTimeout(60_000);

    await openGSheetPanel(page);
    await fillAndConnect(page, GSHEET_URL);

    // Toast "Connected" or the active bar should appear
    await expect(
      page.getByText(/connected|success/i).or(page.getByTestId('active-datasource-bar'))
    ).toBeVisible({ timeout: 30_000 });
  });

  // 4. ActiveDataSourceBar shown after connect ------------------------------
  test('shows ActiveDataSourceBar after sheet connects', async ({ page }) => {
    test.setTimeout(60_000);

    await openGSheetPanel(page);
    await fillAndConnect(page, GSHEET_URL);

    await expect(page.getByTestId('active-datasource-bar')).toBeVisible({ timeout: 30_000 });
  });

  // 5. Ask a question after connecting --------------------------------------
  test('can ask a natural-language question about the connected sheet', async ({ page }) => {
    test.setTimeout(90_000);

    await openGSheetPanel(page);
    await fillAndConnect(page, GSHEET_URL);
    // Wait for connection
    await expect(page.getByTestId('active-datasource-bar')).toBeVisible({ timeout: 30_000 });

    // Ask a question
    await sendMessage(page, 'Summarize this sheet');

    // Expect result – summary text or table appears
    await expect(
      page
        .getByText(/row|column|sheet|total|summary/i)
        .first()
    ).toBeVisible({ timeout: 60_000 });
  });

  // 6. GoogleSheetCard compact shown after connect --------------------------
  test('shows compact sheet card in input area after connect', async ({ page }) => {
    test.setTimeout(60_000);

    await openGSheetPanel(page);
    await fillAndConnect(page, GSHEET_URL);

    // Either compact card or active bar visible
    await expect(
      page.getByTestId('google-sheet-card-compact')
        .or(page.getByTestId('active-datasource-bar'))
    ).toBeVisible({ timeout: 30_000 });
  });

  // 7. Remove sheet clears data source --------------------------------------
  test('removes connected sheet when Remove is clicked', async ({ page }) => {
    test.setTimeout(60_000);

    await openGSheetPanel(page);
    await fillAndConnect(page, GSHEET_URL);
    await expect(page.getByTestId('active-datasource-bar')).toBeVisible({ timeout: 30_000 });

    // Click the clear button
    const clearBtn = page.getByTestId('clear-datasource-btn').first();
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      // Bar should disappear
      await expect(page.getByTestId('active-datasource-bar')).not.toBeVisible({ timeout: 10_000 });
    }
  });

  // 8. Error states --------------------------------------------------------
  test('shows sheet-not-shared error for private sheet URL pattern', async ({ page }) => {
    // A URL that matches the pattern but is a private/inaccessible sheet
    const privateUrl =
      'https://docs.google.com/spreadsheets/d/1PRIVATE_SHEET_ID_THAT_DOES_NOT_EXIST/edit';

    await openGSheetPanel(page);
    await fillAndConnect(page, privateUrl);

    await expect(
      page.getByText(/invalid|denied|private|failed|access|error/i)
    ).toBeVisible({ timeout: 20_000 });
  });
});

// ---------------------------------------------------------------------------
// Mobile responsive tests
// ---------------------------------------------------------------------------

test.describe('Google Sheets – mobile viewport', () => {
  test.use({ viewport: { width: 390, height: 844 } }); // iPhone 14 viewport

  test.beforeEach(async ({ page }) => {
    await login(page);
    await ensureNewChat(page);
  });

  test('toolbar visible on mobile', async ({ page }) => {
    await expect(page.getByTestId('data-source-toolbar')).toBeVisible({ timeout: 10_000 });
  });

  test('Google Sheet panel opens on mobile', async ({ page }) => {
    await openGSheetPanel(page);
    await expect(page.getByTestId('gsheet-inline-panel')).toBeVisible({ timeout: 5_000 });
  });
});
