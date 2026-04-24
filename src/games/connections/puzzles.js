// Built-in puzzle bank — 10 puzzles
export const PUZZLES = [
  {
    id: 'daily-1',
    title: 'Puzzle #1',
    categories: [
      { name: 'Things that CRACK', color: 'yellow', words: ['EGG','CODE','KNUCKLE','JOKE'] },
      { name: 'Puzzle games', color: 'green',  words: ['WORDLE','SUDOKU','NERDLE','CRYPTOGRAM'] },
      { name: '___ board', color: 'blue',   words: ['CHESS','BOARD','SURF','CARD'] },
      { name: 'Crackd.live games', color: 'purple', words: ['SCREW','PIN','ROPE','BLOCK'] },
    ],
  },
  {
    id: 'daily-2',
    title: 'Puzzle #2',
    categories: [
      { name: 'Types of music', color: 'yellow', words: ['JAZZ','ROCK','BLUES','SOUL'] },
      { name: '___ ball', color: 'green',  words: ['BASKET','FOOT','TENNIS','CANNON'] },
      { name: 'Planets', color: 'blue',   words: ['MARS','VENUS','SATURN','PLUTO'] },
      { name: 'Card games', color: 'purple', words: ['POKER','SNAP','BRIDGE','WAR'] },
    ],
  },
  {
    id: 'daily-3',
    title: 'Puzzle #3',
    categories: [
      { name: 'Colors + ___', color: 'yellow', words: ['RED','BLUE','GREEN','GOLD'] },
      { name: 'Famous Einsteins', color: 'green',  words: ['ALBERT','BAGELS','E=MC2','THEORY'] },
      { name: 'Kitchen items', color: 'blue',   words: ['WHISK','LADLE','TONGS','GRATER'] },
      { name: 'British slang', color: 'purple', words: ['BRILL','DODGY','CHEEKY','KNACKERED'] },
    ],
  },
  {
    id: 'daily-4',
    title: 'Puzzle #4',
    categories: [
      { name: 'Types of cheese', color: 'yellow', words: ['BRIE','EDAM','GOUDA','FETA'] },
      { name: 'Spy gadgets', color: 'green',  words: ['LASER','GRAPPLE','PEN','WATCH'] },
      { name: 'Math symbols', color: 'blue',   words: ['PLUS','MINUS','TIMES','DIVIDE'] },
      { name: 'Things that puzzle', color: 'purple', words: ['RIDDLE','CIPHER','MAZE','ENIGMA'] },
    ],
  },
  {
    id: 'daily-5',
    title: 'Puzzle #5',
    categories: [
      { name: 'Ocean creatures', color: 'yellow', words: ['SHARK','WHALE','SQUID','CRAB'] },
      { name: '___ light', color: 'green',  words: ['FLASH','MOON','STAR','TRAFFIC'] },
      { name: 'Greek letters', color: 'blue',   words: ['ALPHA','BETA','GAMMA','DELTA'] },
      { name: 'Coding terms', color: 'purple', words: ['BUG','LOOP','STACK','COMMIT'] },
    ],
  },
];

export function getDailyPuzzle() {
  const today = new Date().toISOString().slice(0, 10);
  const ref = new Date('2025-01-01').getTime();
  const dayIndex = Math.floor((new Date(today).getTime() - ref) / 86400000);
  return PUZZLES[((dayIndex % PUZZLES.length) + PUZZLES.length) % PUZZLES.length];
}

export function getRandomPuzzle(excludeId) {
  const available = PUZZLES.filter(p => p.id !== excludeId);
  return available[Math.floor(Math.random() * available.length)];
}
