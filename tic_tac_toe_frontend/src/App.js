import React, { useState, useEffect } from "react";
import "./App.css";

/**
 * Color Palette:
 * primary:   #1976d2 (blue - moves/turn/highlight)
 * accent:    #ff9800 (orange - actions, reset, winner)
 * secondary: #ffffff (white - bg, board, text)
 * Modern, minimalistic, and light.
 */

// Helper functions
// PUBLIC_INTERFACE
function calculateWinner(squares) {
  /**
   * Calculates the winner of a tic tac toe board.
   * Returns {winner: X/O/null, line: [idx]}
   */
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6], // Diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: [] };
}

// PUBLIC_INTERFACE
function isBoardFull(squares) {
  /** Returns true if every square is filled with X or O */
  return squares.every((v) => v !== null);
}

// PUBLIC_INTERFACE
function getMoveLocation(moveIndex) {
  /** Given a board index [0-8], returns [row,col] 1-based */
  return [Math.floor(moveIndex / 3) + 1, (moveIndex % 3) + 1];
}

/**
 * Board renders the full tic tac toe board
 */
// PUBLIC_INTERFACE
function Board({ squares, onSquareClick, highlight }) {
  /** 
   * squares: array of 9 elements (X, O, or null)
   * onSquareClick(i): click handler
   * highlight: array of winning indices
   */
  return (
    <div className="ttt-board">
      {[0, 1, 2].map((row) => (
        <div className="ttt-board-row" key={row}>
          {[0, 1, 2].map((col) => {
            const idx = 3 * row + col;
            const isWinning = highlight && highlight.includes(idx);
            return (
              <button
                // PUBLIC_INTERFACE
                key={idx}
                className={`ttt-square${isWinning ? " ttt-square-winner" : ""}`}
                onClick={() => onSquareClick(idx)}
                aria-label={`Mark position row ${row + 1}, column ${col + 1}`}
                tabIndex={0}
              >
                {squares[idx]}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/**
 * MoveHistory renders the move history log and enables time travel
 */
// PUBLIC_INTERFACE
function MoveHistory({ history, jumpTo, currentStep }) {
  /**
   * history: array of {squares, moveAt, player}
   * jumpTo: fn(step)
   * currentStep: current step number (0=begin)
   */
  return (
    <nav className="ttt-history">
      <p className="ttt-history-header" style={{ margin: 0, color: "#1976d2", fontWeight: 600 }}>
        Move History
      </p>
      <ol>
        {history.map((step, move) => {
          let desc;
          if (move === 0) {
            desc = "Game start";
          } else {
            const [row, col] = getMoveLocation(step.moveAt);
            desc = `Move #${move}: ${step.player} → (${row},${col})`;
          }
          return (
            <li key={move}>
              <button
                className={`ttt-history-btn${move === currentStep ? " current" : ""}`}
                onClick={() => jumpTo(move)}
                disabled={move === currentStep}
              >
                {desc}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/**
 * PUBLIC_INTERFACE
 * The main game app, integrated with theme and responsive layout.
 */
function App() {
  // Game state
  const [history, setHistory] = useState([
    {
      squares: Array(9).fill(null),
      moveAt: null, // index of changed position
      player: null,
    },
  ]);
  const [stepNumber, setStepNumber] = useState(0);
  const [xIsNext, setXIsNext] = useState(true);

  // UI: light theme colors only
  useEffect(() => {
    // Override the theme for light mode, and inject custom palette
    document.documentElement.setAttribute("data-theme", "light");
    document.documentElement.style.setProperty("--bg-primary", "#ffffff");
    document.documentElement.style.setProperty("--bg-secondary", "#f5f7fa");
    document.documentElement.style.setProperty("--text-primary", "#222e38");
    document.documentElement.style.setProperty("--ttt-primary", "#1976d2");
    document.documentElement.style.setProperty("--ttt-accent", "#ff9800");
    document.documentElement.style.setProperty("--ttt-secondary", "#ffffff");
    document.documentElement.style.setProperty("--ttt-board-line", "#d5d7de");
  }, []);

  const current = history[stepNumber];
  const result = calculateWinner(current.squares);
  const winner = result.winner;
  const draw = !winner && isBoardFull(current.squares);

  // PUBLIC_INTERFACE
  function handleSquareClick(i) {
    if (winner || current.squares[i]) {
      return;
    }
    // Clone up to current step
    const trimmedHistory = history.slice(0, stepNumber + 1);
    const squares = current.squares.slice();
    squares[i] = xIsNext ? "X" : "O";
    setHistory(
      trimmedHistory.concat([
        {
          squares: squares,
          moveAt: i,
          player: xIsNext ? "X" : "O",
        },
      ])
    );
    setStepNumber(trimmedHistory.length);
    setXIsNext((prev) => !prev);
  }

  // PUBLIC_INTERFACE
  function jumpTo(step) {
    setStepNumber(step);
    setXIsNext(step % 2 === 0); // X always starts, alternates with even/odd
  }

  // PUBLIC_INTERFACE
  function handleRestart() {
    setHistory([
      {
        squares: Array(9).fill(null),
        moveAt: null,
        player: null,
      },
    ]);
    setStepNumber(0);
    setXIsNext(true);
  }

  let status;
  if (winner) {
    status = (
      <span>
        🎉 <span className="ttt-winner">{winner}</span> wins!
      </span>
    );
  } else if (draw) {
    status = <span>It's a draw!</span>;
  } else {
    status = (
      <span>
        <span className="ttt-turn">{xIsNext ? "X" : "O"}</span>
        &apos;s turn
      </span>
    );
  }

  // App Layout: centered, modern, minimal
  return (
    <div className="ttt-app-root">
      <header className="ttt-header">
        <h1 className="ttt-title" tabIndex={0} aria-label="Tic Tac Toe">
          Tic Tac Toe
        </h1>
        <div className="ttt-status" aria-live="polite">
          {status}
        </div>
        <div className="ttt-header-controls">
          <button
            className="ttt-btn ttt-btn-accent"
            onClick={handleRestart}
            aria-label="Restart game"
          >
            Restart Game
          </button>
        </div>
      </header>

      <main className="ttt-main">
        <Board
          squares={current.squares}
          onSquareClick={handleSquareClick}
          highlight={result.line}
        />
        <div className="ttt-below-board-controls">
          <MoveHistory
            history={history}
            jumpTo={jumpTo}
            currentStep={stepNumber}
          />
        </div>
      </main>

      <footer className="ttt-footer">
        <span className="ttt-footer-text">
          <span style={{ color: "#1976d2", fontWeight: 600 }}>X</span> is{" "}
          <span style={{ textDecoration: "underline" }}>blue</span>,{" "}
          <span style={{ color: "#ff9800", fontWeight: 600 }}>O</span> is{" "}
          <span style={{ textDecoration: "underline" }}>orange</span>.
        </span>
      </footer>
    </div>
  );
}

export default App;
