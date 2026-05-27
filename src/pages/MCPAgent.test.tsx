import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MCPAgent from './MCPAgent';

vi.mock('../lib/api', async () => {
  const actual = await vi.importActual('../lib/api');
  return {
    ...actual,
    API_BASE_URL: 'http://localhost:8000/api',
  };
});

describe('MCPAgent Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [],
        })
    );
  });

  it('renders the agent interface', () => {
    render(<MCPAgent />);

    expect(screen.getByText('MCP Agent')).toBeInTheDocument();
    expect(screen.getByText(/Multi-tool orchestration/)).toBeInTheDocument();
  });

  it('renders input and send button', () => {
    render(<MCPAgent />);

    expect(screen.getByPlaceholderText(/Ask the agent to perform a task/)).toBeInTheDocument();
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('clears input and shows agent response after submit', async () => {
    const mockedFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Task completed',
          tool_results: [],
          tools_used: [],
          reasoning: '',
          error: '',
        }),
      });

    vi.stubGlobal('fetch', mockedFetch);

    render(<MCPAgent />);

    const input = screen.getByPlaceholderText(/Ask the agent to perform a task/) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'test task' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(input.value).toBe('');
      expect(screen.getByText('Task completed')).toBeInTheDocument();
    });
  });

  it('shows tool log with error status when tool fails', async () => {
    const mockedFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Could not complete that task.',
          tool_results: [
            {
              tool: 'search_arxiv',
              result: 'Error: upstream unavailable',
              args: { query: 'transformers' },
              error: true,
            },
          ],
          tools_used: ['search_arxiv'],
          reasoning: 'Tool failed',
          error: '',
        }),
      });

    vi.stubGlobal('fetch', mockedFetch);

    render(<MCPAgent />);

    const input = screen.getByPlaceholderText(/Ask the agent to perform a task/);
    fireEvent.change(input, { target: { value: 'Search arXiv' } });
    fireEvent.submit(input.closest('form') as HTMLFormElement);

    await waitFor(() => {
      expect(screen.getAllByText(/search_arxiv/).length).toBeGreaterThan(0);
      expect(screen.getByText(/Error/)).toBeInTheDocument();
    });
  });
});
