// Sudoku generator & solver

function isValid(board, row, col, num) {
  for (let c = 0; c < 9; c++) if (board[row][c] === num) return false;
  for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) if (board[br + r][bc + c] === num) return false;
  return true;
}

function solve(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for (const n of nums) {
          if (isValid(board, r, c, n)) {
            board[r][c] = n;
            if (solve(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function countSolutions(board, limit = 2) {
  let count = 0;
  function bt() {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let n = 1; n <= 9; n++) {
            if (isValid(board, r, c, n)) {
              board[r][c] = n;
              bt();
              board[r][c] = 0;
              if (count >= limit) return;
            }
          }
          return;
        }
      }
    }
    count++;
  }
  bt();
  return count;
}

const CLUE_COUNTS = { Easy: 45, Medium: 35, Hard: 28, Expert: 24, Evil: 22 };

export function generatePuzzle(difficulty = 'Medium') {
  // Generate full solution
  const solution = Array.from({ length: 9 }, () => Array(9).fill(0));
  solve(solution);

  // Create puzzle by removing cells
  const puzzle = solution.map(r => [...r]);
  const cells  = shuffle(Array.from({ length: 81 }, (_, i) => i));
  const clues = CLUE_COUNTS[difficulty] || 35;
  let removed = 0;

  for (const idx of cells) {
    if (81 - removed <= clues) break;
    const r = Math.floor(idx / 9), c = idx % 9;
    const backup = puzzle[r][c];
    puzzle[r][c] = 0;
    const copy = puzzle.map(row => [...row]);
    if (countSolutions(copy) !== 1) {
      puzzle[r][c] = backup;
    } else {
      removed++;
    }
  }

  return {
    puzzle: puzzle.map(r => [...r]),
    solution: solution.map(r => [...r]),
  };
}

export function getCellIndex(row, col) { return row * 9 + col; }
export function getBoxIndex(row, col) { return Math.floor(row / 3) * 3 + Math.floor(col / 3); }
