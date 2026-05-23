import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TicTacToe from './TicTacToe';

vi.mock('../lib/api', () => ({
  getTicTacToeAIMove: vi.fn(),
}));

import { getTicTacToeAIMove } from '../lib/api';

describe('TicTacToe page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders board and restart button', () => {
    render(<TicTacToe />);
    expect(screen.getByText('Project 11: AI Tic Tac Toe Agent')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restart Game/i })).toBeInTheDocument();
  });

  it('calls backend for AI move after user click', async () => {
    const mockMove = getTicTacToeAIMove as unknown as ReturnType<typeof vi.fn>;
    mockMove.mockResolvedValueOnce({
      board: ['X', '', '', '', 'O', '', '', '', ''],
      ai_move: 4,
      winner: null,
      is_draw: false,
      game_over: false,
      reasoning: 'Center control is strongest.',
    });

    render(<TicTacToe />);
    const cells = screen.getAllByRole('button').filter((b) => b.textContent === '·');
    fireEvent.click(cells[0]);

    await waitFor(() => {
      expect(mockMove).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/Center control is strongest/i)).toBeInTheDocument();
    });
  });
});
