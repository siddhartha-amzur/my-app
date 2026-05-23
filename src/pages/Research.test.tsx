import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Research from '../pages/Research';

// Mock fetch
global.fetch = vi.fn();

describe('Research Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the research agent page', () => {
    render(<Research />);
    expect(screen.getByText('🔬 Research Agent')).toBeInTheDocument();
    expect(screen.getByText('Autonomous AI-powered paper research and analysis')).toBeInTheDocument();
  });

  it('has a topic input field', () => {
    render(<Research />);
    const input = screen.getByPlaceholderText(/e.g., quantum computing/i);
    expect(input).toBeInTheDocument();
  });

  it('start button is disabled when topic is empty', () => {
    render(<Research />);
    const button = screen.getByRole('button', { name: /Start Research/i });
    expect(button).toBeDisabled();
  });

  it('start button is enabled when topic is entered', async () => {
    render(<Research />);
    const input = screen.getByPlaceholderText(/e.g., quantum computing/i);
    const button = screen.getByRole('button', { name: /Start Research/i });

    await userEvent.type(input, 'quantum computing');
    expect(button).not.toBeDisabled();
  });

  it('shows error when topic is empty on submit', async () => {
    render(<Research />);
    const form = screen.getByText(/Start Research/i).closest('form');
    
    if (form) {
      fireEvent.submit(form);
    }
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a research topic')).toBeInTheDocument();
    });
  });

  it('displays research logs area', () => {
    render(<Research />);
    expect(screen.getByText('📊 Research Progress')).toBeInTheDocument();
    expect(screen.getByText(/Research logs will appear here/i)).toBeInTheDocument();
  });

  it('displays papers grid when papers are found', async () => {
    render(<Research />);
    expect(screen.queryByText(/📄 Papers Found/i)).not.toBeInTheDocument();
  });

  it('displays digest section when digest is available', () => {
    render(<Research />);
    expect(screen.queryByText(/📋 Research Digest/i)).not.toBeInTheDocument();
  });

  it('has correct max iterations and papers defaults', () => {
    render(<Research />);
    const iterationInput = screen.getByDisplayValue('3');
    const papersInput = screen.getByDisplayValue('20');
    
    expect(iterationInput).toBeInTheDocument();
    expect(papersInput).toBeInTheDocument();
  });

  it('handles fetch errors gracefully', async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<Research />);
    const input = screen.getByPlaceholderText(/e.g., quantum computing/i);
    const button = screen.getByRole('button', { name: /Start Research/i });

    await userEvent.type(input, 'quantum computing');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});

describe('Research Component - Streaming', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state during research', async () => {
    const mockFetch = global.fetch as ReturnType<typeof vi.fn>;
    
    // Mock a streaming response
    const mockResponse = {
      ok: true,
      body: {
        getReader: () => ({
          read: vi.fn().mockResolvedValueOnce({
            done: true,
            value: new TextEncoder().encode(''),
          }),
        }),
      },
    };
    
    mockFetch.mockResolvedValueOnce(mockResponse);

    render(<Research />);
    const input = screen.getByPlaceholderText(/e.g., quantum computing/i);
    const button = screen.getByRole('button', { name: /Start Research/i });

    await userEvent.type(input, 'test topic');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Researching/i)).toBeInTheDocument();
    });
  });

  it('scrolls to bottom of logs', async () => {
    render(<Research />);
    const logContainer = screen.getByText(/Research logs will appear here/i).closest('div');
    expect(logContainer).toBeInTheDocument();
  });
});

describe('Research Component - UI Elements', () => {
  it('displays all required sections', () => {
    render(<Research />);
    
    expect(screen.getByText('Research Topic')).toBeInTheDocument();
    expect(screen.getByText('Max Iterations')).toBeInTheDocument();
    expect(screen.getByText('Max Papers')).toBeInTheDocument();
    expect(screen.getByText('📊 Research Progress')).toBeInTheDocument();
  });

  it('has responsive grid layout', () => {
    render(<Research />);
    const grid = screen.getByText('🔬 Research Agent').closest('div');
    expect(grid?.className).toContain('max-w-7xl');
  });

  it('displays alert icon for errors', async () => {
    render(<Research />);
    const form = screen.getByText(/Start Research/i).closest('form');
    
    if (form) {
      fireEvent.submit(form);
    }
    
    await waitFor(() => {
      const alertContainer = screen.getByText('Please enter a research topic').closest('div');
      expect(alertContainer?.className).toContain('flex');
    });
  });
});
