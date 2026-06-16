import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

// ── Win combinations ──────────────────────────────────
const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6],             // diagonals
];

// ── AI (minimax) ──────────────────────────────────────
function minimax(board, depth, isMaximizing) {
  const result = checkWinner(board);
  if (result === 'O') return 10 - depth;
  if (result === 'X') return depth - 10;
  if (board.every(Boolean)) return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return best;
  }
}

function getBestMove(board) {
  let bestVal = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const val = minimax(board, 0, false);
      board[i] = null;
      if (val > bestVal) { bestVal = val; bestMove = i; }
    }
  }
  return bestMove;
}

function checkWinner(board) {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function getWinLine(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

// ── Neon X SVG ────────────────────────────────────────
function NeonX({ animate }) {
  return (
    <svg viewBox="0 0 100 100" className={`symbol-svg ${animate ? 'symbol-pop' : ''}`}>
      <defs>
        <filter id="glow-x" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <line x1="18" y1="18" x2="82" y2="82" stroke="#00BFFF" strokeWidth="10" strokeLinecap="round" filter="url(#glow-x)" />
      <line x1="82" y1="18" x2="18" y2="82" stroke="#00BFFF" strokeWidth="10" strokeLinecap="round" filter="url(#glow-x)" />
      <line x1="18" y1="18" x2="82" y2="82" stroke="#7DF9FF" strokeWidth="4" strokeLinecap="round" />
      <line x1="82" y1="18" x2="18" y2="82" stroke="#7DF9FF" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// ── Neon O SVG ────────────────────────────────────────
function NeonO({ animate }) {
  return (
    <svg viewBox="0 0 100 100" className={`symbol-svg ${animate ? 'symbol-pop' : ''}`}>
      <defs>
        <filter id="glow-o" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur1" />
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="blur1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="50" cy="50" r="33" fill="none" stroke="#FF1E56" strokeWidth="10" filter="url(#glow-o)" />
      <circle cx="50" cy="50" r="33" fill="none" stroke="#FF6B9D" strokeWidth="4" />
    </svg>
  );
}

// ── Confetti particle ────────────────────────────────
function Particle({ color, x, y, angle, speed, size }) {
  const style = {
    position: 'fixed',
    left: x,
    top: y,
    width: size,
    height: size,
    background: color,
    borderRadius: Math.random() > 0.5 ? '50%' : '2px',
    animation: `particle-fly 1.4s ease-out forwards`,
    '--dx': `${Math.cos(angle) * speed}px`,
    '--dy': `${Math.sin(angle) * speed}px`,
    animationDelay: `${Math.random() * 0.3}s`,
    boxShadow: `0 0 6px ${color}`,
    pointerEvents: 'none',
    zIndex: 9999,
  };
  return <div style={style} />;
}

// ── Grid lines component ──────────────────────────────
function GridLines() {
  return (
    <svg className="grid-svg" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="grid-glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Vertical lines */}
      <line x1="120" y1="10" x2="120" y2="350" stroke="#8B00FF" strokeWidth="2.5" filter="url(#grid-glow)" />
      <line x1="240" y1="10" x2="240" y2="350" stroke="#8B00FF" strokeWidth="2.5" filter="url(#grid-glow)" />
      {/* Horizontal lines */}
      <line x1="10" y1="120" x2="350" y2="120" stroke="#8B00FF" strokeWidth="2.5" filter="url(#grid-glow)" />
      <line x1="10" y1="240" x2="350" y2="240" stroke="#8B00FF" strokeWidth="2.5" filter="url(#grid-glow)" />
      {/* Bright core */}
      <line x1="120" y1="10" x2="120" y2="350" stroke="#BF5FFF" strokeWidth="1" />
      <line x1="240" y1="10" x2="240" y2="350" stroke="#BF5FFF" strokeWidth="1" />
      <line x1="10" y1="120" x2="350" y2="120" stroke="#BF5FFF" strokeWidth="1" />
      <line x1="10" y1="240" x2="350" y2="240" stroke="#BF5FFF" strokeWidth="1" />
    </svg>
  );
}

// ── Cell component ────────────────────────────────────
function Cell({ value, onClick, isWinCell, isDisabled, index }) {
  const [justPlaced, setJustPlaced] = useState(false);
  const prevValue = useRef(null);

  useEffect(() => {
    if (value && !prevValue.current) {
      setJustPlaced(true);
      setTimeout(() => setJustPlaced(false), 500);
    }
    prevValue.current = value;
  }, [value]);

  const cellClass = [
    'cell',
    isWinCell ? 'cell-win' : '',
    value === 'X' ? 'cell-x' : value === 'O' ? 'cell-o' : '',
    isDisabled && !value ? 'cell-disabled' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cellClass} onClick={!isDisabled && !value ? onClick : undefined}>
      {value === 'X' && <NeonX animate={justPlaced} />}
      {value === 'O' && <NeonO animate={justPlaced} />}
      {!value && !isDisabled && <div className="cell-hover-ghost" />}
    </div>
  );
}

// ── Score badge ───────────────────────────────────────
function ScoreBadge({ label, score, isActive, player }) {
  return (
    <div className={`score-badge ${isActive ? 'score-active' : ''} score-${player}`}>
      <div className="score-label">{label}</div>
      <div className="score-num">{score}</div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────
export default function App() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0, D: 0 });
  const [mode, setMode] = useState('pvp'); // 'pvp' | 'ai'
  const [gameOver, setGameOver] = useState(false);
  const [particles, setParticles] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [aiMoving, setAiMoving] = useState(false);

  const winner = checkWinner(board);
  const winLine = getWinLine(board);
  const isDraw = !winner && board.every(Boolean);

  // Status message
  useEffect(() => {
    if (winner) {
      const name = winner === 'O' && mode === 'ai' ? 'AI' : `Player ${winner}`;
      setStatusMsg(`${name} WINS!`);
    } else if (isDraw) {
      setStatusMsg("DRAW!");
    } else {
      const turn = xIsNext ? 'X' : 'O';
      const name = !xIsNext && mode === 'ai' ? 'AI' : `Player ${turn}`;
      setStatusMsg(`${name}'s TURN`);
    }
  }, [winner, isDraw, xIsNext, mode]);

  // Handle game over
  useEffect(() => {
    if (winner) {
      setGameOver(true);
      setScores(s => ({ ...s, [winner]: s[winner] + 1 }));
      spawnParticles(winner);
    } else if (isDraw) {
      setGameOver(true);
      setScores(s => ({ ...s, D: s.D + 1 }));
    }
  }, [winner, isDraw]);

  // AI move
  useEffect(() => {
    if (mode === 'ai' && !xIsNext && !gameOver) {
      setAiMoving(true);
      const t = setTimeout(() => {
        const b = [...board];
        const move = getBestMove(b);
        if (move !== -1) {
          b[move] = 'O';
          setBoard(b);
          setXIsNext(true);
        }
        setAiMoving(false);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [xIsNext, mode, gameOver, board]);

  function spawnParticles(winner) {
    const colors = winner === 'X'
      ? ['#00BFFF', '#7DF9FF', '#00FFFF', '#4FC3F7']
      : ['#FF1E56', '#FF6B9D', '#FF4081', '#F48FB1'];
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const newParticles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: cx + (Math.random() - 0.5) * 200,
      y: cy + (Math.random() - 0.5) * 200,
      angle: (Math.PI * 2 * i) / 40,
      speed: 80 + Math.random() * 120,
      size: 6 + Math.random() * 8,
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  }

  function handleClick(idx) {
    if (board[idx] || gameOver || aiMoving || (!xIsNext && mode === 'ai')) return;
    const newBoard = [...board];
    newBoard[idx] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setGameOver(false);
    setAiMoving(false);
  }

  function resetAll() {
    resetGame();
    setScores({ X: 0, O: 0, D: 0 });
  }

  function switchMode(m) {
    setMode(m);
    resetAll();
  }

  const isDisabled = gameOver || aiMoving || (!xIsNext && mode === 'ai');

  return (
    <div className="app">
      {/* Animated background */}
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />

      {/* Particles */}
      {particles.map(p => <Particle key={p.id} {...p} />)}

      <div className="container">
        {/* Title */}
        <div className="title-wrap">
          <h1 className="title">
            <span className="title-x">TIC</span>
            <span className="title-sep">·</span>
            <span className="title-o">TAC</span>
            <span className="title-sep">·</span>
            <span className="title-x">TOE</span>
          </h1>
          <p className="title-sub">NEON EDITION</p>
        </div>

        {/* Mode toggle */}
        <div className="mode-toggle">
          <button
            className={`mode-btn ${mode === 'pvp' ? 'mode-btn-active' : ''}`}
            onClick={() => switchMode('pvp')}
          >
            👥 2 PLAYERS
          </button>
          <button
            className={`mode-btn ${mode === 'ai' ? 'mode-btn-active' : ''}`}
            onClick={() => switchMode('ai')}
          >
            🤖 VS AI
          </button>
        </div>

        {/* Scoreboard */}
        <div className="scoreboard">
          <ScoreBadge
            label={mode === 'ai' ? 'YOU (X)' : 'PLAYER X'}
            score={scores.X}
            isActive={xIsNext && !gameOver}
            player="x"
          />
          <div className="score-draw">
            <div className="score-label">DRAWS</div>
            <div className="score-num draw-num">{scores.D}</div>
          </div>
          <ScoreBadge
            label={mode === 'ai' ? 'AI (O)' : 'PLAYER O'}
            score={scores.O}
            isActive={!xIsNext && !gameOver}
            player="o"
          />
        </div>

        {/* Status */}
        <div className={`status ${winner === 'X' ? 'status-x' : winner === 'O' ? 'status-o' : isDraw ? 'status-draw' : xIsNext ? 'status-x' : 'status-o'}`}>
          {statusMsg}
          {aiMoving && <span className="ai-dots"><span>.</span><span>.</span><span>.</span></span>}
        </div>

        {/* Board */}
        <div className="board-wrap">
          <GridLines />
          <div className="board">
            {board.map((val, idx) => (
              <Cell
                key={idx}
                index={idx}
                value={val}
                onClick={() => handleClick(idx)}
                isWinCell={winLine?.includes(idx)}
                isDisabled={isDisabled}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="btn-row">
          <button className="btn btn-new" onClick={resetGame}>
            ⚡ NEW GAME
          </button>
          <button className="btn btn-reset" onClick={resetAll}>
            ↺ RESET
          </button>
        </div>
      </div>
    </div>
  );
}
