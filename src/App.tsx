import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import Research from './pages/Research';
import TicTacToe from './pages/TicTacToe';
import MCPAgent from './pages/MCPAgent';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/research" element={<Research />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/mcp-agent" element={<MCPAgent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
