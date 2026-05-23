import { useMemo, useState } from 'react';
import { getTicTacToeAIMove } from '../lib/api';

type Cell = '' | 'X' | 'O';

const WIN_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]): Cell | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function isDraw(board: Cell[]): boolean {
  return board.every((cell) => cell !== '') && !checkWinner(board);
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(''));
  const [gameOver, setGameOver] = useState(false);
  const [status, setStatus] = useState('Your turn (X)');
  const [reasoning, setReasoning] = useState('');
  const [aiThinking, setAiThinking] = useState(false);
  const [error, setError] = useState('');

  const humanSymbol: Cell = 'X';
  const aiSymbol: Cell = 'O';

  const winner = useMemo(() => checkWinner(board), [board]);
  const draw = useMemo(() => isDraw(board), [board]);

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setGameOver(false);
    setStatus('Your turn (X)');
    setReasoning('');
    setError('');
    setAiThinking(false);
  };

  const handleCellClick = async (index: number) => {
    if (aiThinking || gameOver || board[index] !== '') {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = humanSymbol;
    setBoard(nextBoard);
    setError('');

    const userWinner = checkWinner(nextBoard);
    if (userWinner) {
      setGameOver(true);
      setStatus('You win!');
      setReasoning('Great move sequence. You completed a winning line before the AI could block.');
      return;
    }

    if (isDraw(nextBoard)) {
      setGameOver(true);
      setStatus('Draw game');
      setReasoning('No winning lines left for either side.');
      return;
    }

    setAiThinking(true);
    setStatus('AI is thinking...');

    try {
      const response = await getTicTacToeAIMove({
        board: nextBoard,
        human_symbol: humanSymbol,
        ai_symbol: aiSymbol,
      });

      const updatedBoard = response.board as Cell[];
      setBoard(updatedBoard);
      setReasoning(response.reasoning || 'AI selected a strategic move.');

      if (response.winner === aiSymbol) {
        setGameOver(true);
        setStatus('AI wins');
      } else if (response.winner === humanSymbol) {
        setGameOver(true);
        setStatus('You win!');
      } else if (response.is_draw) {
        setGameOver(true);
        setStatus('Draw game');
      } else {
        setStatus('Your turn (X)');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get AI move';
      setError(message);
      setStatus('Your turn (X)');
    } finally {
      setAiThinking(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '24px 14px',
        background: 'radial-gradient(circle at 20% 20%, #f6f1c6 0%, #d9e4ff 45%, #c8f1e2 100%)',
      }}
    >
      <div
        style={{
          maxWidth: '840px',
          margin: '0 auto',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '20px',
          padding: '24px',
          border: '1px solid rgba(18, 43, 85, 0.14)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '36px', color: '#14254f', textAlign: 'left' }}>Project 11: AI Tic Tac Toe Agent</h1>
        <p style={{ marginTop: '8px', color: '#31456f', textAlign: 'left' }}>
          Play as X. The AI agent (O) uses minimax strategy with LangChain reasoning.
        </p>

        <div
          style={{
            marginTop: '20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(80px, 130px))',
            gap: '10px',
            justifyContent: 'center',
          }}
        >
          {board.map((cell, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleCellClick(index)}
              disabled={aiThinking || gameOver || cell !== ''}
              style={{
                aspectRatio: '1',
                borderRadius: '14px',
                border: '2px solid #2749b3',
                background: cell === '' ? '#ffffff' : '#ecf2ff',
                color: cell === 'X' ? '#1f6f43' : '#8a2e57',
                fontSize: '40px',
                fontWeight: 800,
                cursor: aiThinking || gameOver || cell !== '' ? 'not-allowed' : 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                boxShadow: '0 8px 16px rgba(39, 73, 179, 0.15)',
              }}
            >
              {cell || '·'}
            </button>
          ))}
        </div>

        <div
          style={{
            marginTop: '20px',
            padding: '14px',
            borderRadius: '12px',
            background: '#f4f8ff',
            border: '1px solid #cad6f7',
            textAlign: 'left',
          }}
        >
          <div style={{ fontWeight: 700, color: '#1b356d' }}>Status: {status}</div>
          {winner && <div style={{ marginTop: '6px', color: '#8a2e57' }}>Winner: {winner}</div>}
          {draw && !winner && <div style={{ marginTop: '6px', color: '#1f6f43' }}>Result: Draw</div>}
          {error && <div style={{ marginTop: '6px', color: '#b42318' }}>Error: {error}</div>}
        </div>

        <div
          style={{
            marginTop: '14px',
            padding: '14px',
            borderRadius: '12px',
            background: '#fff8ee',
            border: '1px solid #f2d3a1',
            textAlign: 'left',
            minHeight: '84px',
          }}
        >
          <strong style={{ color: '#7a4b04' }}>AI Reasoning</strong>
          <p style={{ marginTop: '8px', color: '#5a4a33' }}>
            {reasoning || 'AI reasoning will appear after the first AI move.'}
          </p>
        </div>

        <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={resetGame}
            style={{
              border: 'none',
              borderRadius: '10px',
              background: '#2749b3',
              color: 'white',
              fontWeight: 700,
              padding: '10px 16px',
              cursor: 'pointer',
            }}
          >
            Restart Game
          </button>
        </div>
      </div>
    </div>
  );
}
