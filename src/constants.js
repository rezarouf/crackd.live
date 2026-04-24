export const GAMES = [
  { id: 'wordle', name: 'Wordle', icon: '🔤', type: 'word', desc: 'Guess the 5-letter word in 6 tries', xp: 100, difficulty: 'Medium', done: true },
  { id: 'connections', name: 'Connections', icon: '🔗', type: 'word', desc: 'Group 16 words into 4 categories', xp: 120, difficulty: 'Hard', done: true },
  { id: 'nerdle', name: 'Nerdle', icon: '🔢', type: 'word', desc: 'Guess the equation in 6 tries', xp: 130, difficulty: 'Hard', done: false },
  { id: 'cryptogram', name: 'Cryptogram', icon: '🔐', type: 'word', desc: 'Decode the encrypted message', xp: 150, difficulty: 'Expert', done: false },
  { id: 'sudoku', name: 'Sudoku', icon: '🔳', type: 'word', desc: 'Fill the 9×9 grid with digits', xp: 110, difficulty: 'Medium', done: false },
  { id: 'screw', name: 'Screw Puzzle', icon: '🔩', type: 'visual', desc: 'Unscrew and free the bolts by color', xp: 90, difficulty: 'Easy', done: true },
  { id: 'pin', name: 'Pin Pull', icon: '📌', type: 'visual', desc: 'Pull pins in the right order', xp: 80, difficulty: 'Easy', done: false },
  { id: 'rope', name: 'Rope Untangle', icon: '🪢', type: 'visual', desc: 'Untangle the knotted ropes', xp: 95, difficulty: 'Medium', done: false },
  { id: 'wood', name: 'Wood Block', icon: '🟫', type: 'visual', desc: 'Slide blocks to clear the board', xp: 100, difficulty: 'Medium', done: false },
  { id: 'nuts', name: 'Nuts & Bolts', icon: '⚙️', type: 'visual', desc: 'Match and tighten nut-bolt pairs', xp: 85, difficulty: 'Easy', done: false },
];

export const ALL_PLAYERS = [
  { rank: 1,   name: 'xCipherKing', country: '🇺🇸', xp: 9840, streak: 94, winRate: 96, speed: '1:12', avatar: 'CK', color: '#F5A623' },
  { rank: 2,   name: 'PuzzlrPro',   country: '🇬🇧', xp: 9210, streak: 67, winRate: 91, speed: '1:28', avatar: 'PP', color: '#8B95A1' },
  { rank: 3,   name: 'GridMaster9', country: '🇩🇪', xp: 8755, streak: 51, winRate: 88, speed: '1:44', avatar: 'GM', color: '#CD7F32' },
  { rank: 4,   name: 'SolveQueen',  country: '🇫🇷', xp: 8100, streak: 44, winRate: 85, speed: '1:51', avatar: 'SQ', color: '#4A9EFF' },
  { rank: 5,   name: 'CrackdDaily', country: '🇨🇦', xp: 7890, streak: 38, winRate: 82, speed: '2:02', avatar: 'CD', color: '#4A9EFF' },
  { rank: 6,   name: 'WordWitch',   country: '🇦🇺', xp: 7440, streak: 29, winRate: 79, speed: '2:10', avatar: 'WW', color: '#4A9EFF' },
  { rank: 7,   name: 'NumberNinja', country: '🇯🇵', xp: 7210, streak: 22, winRate: 76, speed: '2:18', avatar: 'NN', color: '#4A9EFF' },
  { rank: 8,   name: 'TileBreaker', country: '🇧🇷', xp: 6980, streak: 19, winRate: 74, speed: '2:25', avatar: 'TB', color: '#4A9EFF' },
  { rank: 9,   name: 'CryptoKing',  country: '🇮🇳', xp: 6710, streak: 15, winRate: 71, speed: '2:33', avatar: 'CK', color: '#4A9EFF' },
  { rank: 10,  name: 'PuzzleGod',   country: '🇰🇷', xp: 6490, streak: 11, winRate: 69, speed: '2:41', avatar: 'PG', color: '#4A9EFF' },
  { rank: 247, name: 'You',         country: '🇺🇸', xp: 4200, streak: 23, winRate: 61, speed: '3:14', avatar: 'ME', color: '#F5A623', isMe: true },
];

export const DIFF_COLOR = {
  Easy: '#22C55E',
  Medium: '#F5A623',
  Hard: '#4A9EFF',
  Expert: '#EF4444',
};

export const TILE_COLORS = {
  empty:   { bg: 'transparent',           border: 'rgba(255,255,255,0.1)',  color: '#F0F0F0' },
  filled:  { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.25)', color: '#F0F0F0' },
  correct: { bg: '#F5A623',               border: '#F5A623',                color: '#0D0F14' },
  present: { bg: '#4A9EFF',               border: '#4A9EFF',                color: '#fff'    },
  absent:  { bg: '#2A2F3A',               border: '#2A2F3A',                color: '#8B95A1' },
};
