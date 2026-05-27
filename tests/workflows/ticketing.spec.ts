import { expect, test } from '@playwright/test';

interface MockTicket {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: 'Billing' | 'Technical' | 'Login' | 'Refund' | 'General';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  created_at: string;
  updated_at: string;
}

test.describe('Ticketing Sidecar UI', () => {
  test.beforeEach(async ({ page }) => {
    const thread = {
      id: '11111111-1111-4111-8111-111111111111',
      user_id: '22222222-2222-4222-8222-222222222222',
      title: 'Support Ticket',
      created_at: new Date().toISOString(),
    };

    const messages: Array<any> = [];
    let currentTicket: MockTicket = {
      id: 'a8f2d8a5-3c6c-4ab8-9023-c2be5e822100',
      user_id: thread.user_id,
      title: 'My payment failed',
      description: 'My payment failed',
      category: 'Billing',
      priority: 'high',
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await page.route('**/api/**', async (route) => {
      const req = route.request();
      const method = req.method();
      const url = new URL(req.url());
      const path = url.pathname;

      if (path === '/api/threads' && method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([thread]) });
        return;
      }

      if (path === '/api/threads' && method === 'POST') {
        await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(thread) });
        return;
      }

      if (path === `/api/threads/${thread.id}/messages` && method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(messages) });
        return;
      }

      if (path === '/api/documents' && method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
        return;
      }

      if (path === '/api/workflows/support' && method === 'POST') {
        const body = req.postDataJSON() as { message: string };
        const message = body.message.toLowerCase();

        if (message.includes('update') || message.includes('priority')) {
          currentTicket = { ...currentTicket, priority: 'urgent', updated_at: new Date().toISOString() };
        }
        if (message.includes('status')) {
          currentTicket = { ...currentTicket, status: 'in_progress', updated_at: new Date().toISOString() };
        }

        const workflowResponse = {
          thread_id: thread.id,
          assistant_response: 'Support workflow completed.',
          workflow_status: 'completed',
          workflow_step: message.includes('status') ? 'status_lookup' : message.includes('update') ? 'ticket_update' : 'ticket_create',
          ticket: currentTicket,
        };

        messages.push({
          id: messages.length + 1,
          thread_id: thread.id,
          message: body.message,
          response: JSON.stringify({
            message_type: 'ticket_result',
            assistant_response: workflowResponse.assistant_response,
            workflow_status: workflowResponse.workflow_status,
            workflow_step: workflowResponse.workflow_step,
            ticket: workflowResponse.ticket,
          }),
          created_at: new Date().toISOString(),
          attachments: [],
        });

        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(workflowResponse) });
        return;
      }

      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
  });

  async function submitMessage(page: any, text: string) {
    const composer = page.getByPlaceholder(/Type your message/i).first();
    await composer.fill(text);
    await page.getByRole('button', { name: 'Send' }).click();
  }

  test('creates and renders a ticket card from support message', async ({ page }) => {
    await page.goto('/chat');
    await submitMessage(page, 'My payment failed. Please create a ticket.');

    await expect(page.getByTestId('ticket-card').first()).toBeVisible();
    await expect(page.getByText('Billing', { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId('ticket-status-badge').first()).toHaveText(/open/i);
  });

  test('updates ticket priority and status via natural language', async ({ page }) => {
    await page.goto('/chat');
    await submitMessage(page, 'Create a ticket for login issue');
    await submitMessage(page, 'Update my ticket priority to urgent');
    await submitMessage(page, 'Check my ticket status');

    await expect(page.getByTestId('ticket-priority-badge').last()).toHaveText(/urgent/i);
    await expect(page.getByTestId('ticket-status-badge').last()).toHaveText(/in_progress/i);
  });

  test('persists workflow messages after refresh', async ({ page }) => {
    await page.goto('/chat');
    await submitMessage(page, 'I need refund support');

    await expect(page.getByTestId('ticket-card').first()).toBeVisible();
    await page.reload();
    await expect(page.getByTestId('ticket-card').first()).toBeVisible();
  });

  test('shows frontend error banner when workflow endpoint fails', async ({ page }) => {
    await page.route('**/api/workflows/support', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: { message: 'n8n webhook failed' } }),
      });
    });

    await page.goto('/chat');
    await submitMessage(page, 'Create a ticket for failed payment');

    await expect(page.getByText(/n8n webhook failed/i).first()).toBeVisible();
  });

  test('renders ticket workflow UI on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/chat');
    await submitMessage(page, 'Create a ticket for login issue');

    await expect(page.getByTestId('ticket-card').first()).toBeVisible();
    await expect(page.getByTestId('ticket-workflow').first()).toBeVisible();
  });
});
