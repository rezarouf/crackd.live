// XP system
export const XP_MULTIPLIERS = {
  Easy:   1,
  Medium: 1.5,
  Hard:   2,
  Expert: 3,
};

export const XP_BASE = {
  wordle:           100,
  connections:      120,
  nerdle:           130,
  cryptogram:       150,
  sudoku:           110,
  screw:             90,
  pinpull:           80,
  rope:              95,
  woodblock:        100,
  nutsbolts:         85,
  // new games
  spellingbee:      120,
  nonogram:         140,
  wordladder:       110,
  flow:             100,
  watersort:         90,
  tilerotation:     130,
  minesweeper:      150,
  merge:            110,
  emojiphrase:       80,
  twentyfortyeight: 160,
};

export const STREAK_BONUSES = [
  { days: 30, multiplier: 1.5,  label: '+50% XP' },
  { days: 7,  multiplier: 1.25, label: '+25% XP' },
  { days: 3,  multiplier: 1.1,  label: '+10% XP' },
];

export const LEVELS = [
  { min: 0,    max: 499,   title: 'Novice',      color: '#8B95A1' },
  { min: 500,  max: 1499,  title: 'Apprentice',  color: '#22C55E' },
  { min: 1500, max: 2999,  title: 'Scholar',     color: '#4A9EFF' },
  { min: 3000, max: 4999,  title: 'Mastermind',  color: '#F5A623' },
  { min: 5000, max: 7999,  title: 'Grandmaster', color: '#A855F7' },
  { min: 8000, max: Infinity, title: 'Legend',   color: '#EF4444' },
];

export const DIFF_COLOR = {
  Easy:   '#22C55E',
  Medium: '#F5A623',
  Hard:   '#4A9EFF',
  Expert: '#EF4444',
};

export const GAMES_META = [
  // ── Original 10 ──────────────────────────────────────────────────────────
  { id: 'wordle',           name: 'Wordle',          icon: '🔤', type: 'word',   route: '/games/wordle',           xp: 100, difficulty: 'Medium', desc: 'Guess the 5-letter word in 6 tries' },
  { id: 'connections',      name: 'Connections',     icon: '🔗', type: 'word',   route: '/games/connections',      xp: 120, difficulty: 'Hard',   desc: 'Group 16 words into 4 hidden categories' },
  { id: 'nerdle',           name: 'Nerdle',          icon: '🔢', type: 'word',   route: '/games/nerdle',           xp: 130, difficulty: 'Hard',   desc: 'Guess the hidden math equation' },
  { id: 'cryptogram',       name: 'Cryptogram',      icon: '🔐', type: 'word',   route: '/games/cryptogram',       xp: 150, difficulty: 'Expert', desc: 'Decode the substitution cipher quote' },
  { id: 'sudoku',           name: 'Sudoku',          icon: '🔳', type: 'word',   route: '/games/sudoku',           xp: 110, difficulty: 'Medium', desc: 'Fill the 9×9 grid with digits 1–9' },
  { id: 'screw',            name: 'Screw Sort',      icon: '🔩', type: 'visual', route: '/games/screw',            xp:  90, difficulty: 'Easy',   desc: 'Sort colored screws onto matching pegs' },
  { id: 'pinpull',          name: 'Pin Pull',        icon: '📌', type: 'visual', route: '/games/pinpull',          xp:  80, difficulty: 'Easy',   desc: 'Pull pins in the right order' },
  { id: 'rope',             name: 'Rope Untangle',   icon: '🪢', type: 'visual', route: '/games/rope',             xp:  95, difficulty: 'Medium', desc: 'Drag nodes until no ropes cross' },
  { id: 'woodblock',        name: 'Wood Block',      icon: '🟫', type: 'visual', route: '/games/woodblock',        xp: 100, difficulty: 'Medium', desc: 'Place blocks to clear rows and columns' },
  { id: 'nutsbolts',        name: 'Nuts & Bolts',    icon: '⚙️', type: 'visual', route: '/games/nutsbolts',        xp:  85, difficulty: 'Easy',   desc: 'Sort colored rings onto matching rods' },
  // ── New 10 ───────────────────────────────────────────────────────────────
  { id: 'spellingbee',      name: 'Spelling Bee',    icon: '🐝', type: 'word',   route: '/games/spellingbee',      xp: 120, difficulty: 'Medium', desc: 'Make words from 7 letters — center letter required' },
  { id: 'nonogram',         name: 'Nonogram',        icon: '🔲', type: 'visual', route: '/games/nonogram',         xp: 140, difficulty: 'Hard',   desc: 'Fill the grid using row and column number clues' },
  { id: 'wordladder',       name: 'Word Ladder',     icon: '🪜', type: 'word',   route: '/games/wordladder',       xp: 110, difficulty: 'Medium', desc: 'Transform a word one letter at a time' },
  { id: 'flow',             name: 'Flow Connect',    icon: '🌊', type: 'visual', route: '/games/flow',             xp: 100, difficulty: 'Medium', desc: 'Connect matching colors to fill every cell' },
  { id: 'watersort',        name: 'Water Sort',      icon: '💧', type: 'visual', route: '/games/watersort',        xp:  90, difficulty: 'Easy',   desc: 'Pour liquid to sort colors into matching tubes' },
  { id: 'tilerotation',     name: 'Circuit',         icon: '⚡', type: 'visual', route: '/games/tilerotation',     xp: 130, difficulty: 'Hard',   desc: 'Rotate tiles to complete the electric circuit' },
  { id: 'minesweeper',      name: 'Minesweeper',     icon: '💣', type: 'visual', route: '/games/minesweeper',      xp: 150, difficulty: 'Hard',   desc: 'Clear the board without triggering a mine' },
  { id: 'merge',            name: 'Merge Tiles',     icon: '🔷', type: 'visual', route: '/games/merge',            xp: 110, difficulty: 'Medium', desc: 'Slide and merge matching tiles to score big' },
  { id: 'emojiphrase',      name: 'Emoji Phrase',    icon: '🤔', type: 'word',   route: '/games/emojiphrase',      xp:  80, difficulty: 'Easy',   desc: 'Decode the phrase hidden in emoji clues' },
  { id: 'twentyfortyeight', name: '2048 Twist',      icon: '🎯', type: 'visual', route: '/games/2048',             xp: 160, difficulty: 'Expert', desc: 'Reach 2048 — but watch out for blocker tiles' },
  { id: 'logoguess',        name: 'Logo Rush',       icon: '🏷️', type: 'visual', route: '/games/logoguess',        xp: 100, difficulty: 'Medium', desc: 'Guess the brand from its logo' },
];

export const FULL_HOUSE_BONUS = 500;
