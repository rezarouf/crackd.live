// Flow Connect puzzles — solutions manually verified:
// • every path step is orthogonally adjacent
// • all paths together cover every grid cell exactly once

export const FLOW_PUZZLES = [
  // Puzzle 1 — 5×5, 3 colors
  // Grid:
  //  A B B B B
  //  A B G G G
  //  A B G G G
  //  A B G G G
  //  A A A A A
  {
    size: 5,
    colors: {
      amber: [[0,0],[4,4]],
      blue:  [[0,4],[3,1]],
      green: [[1,2],[3,4]],
    },
    solution: {
      amber: [[0,0],[1,0],[2,0],[3,0],[4,0],[4,1],[4,2],[4,3],[4,4]],
      blue:  [[0,4],[0,3],[0,2],[0,1],[1,1],[2,1],[3,1]],
      green: [[1,2],[1,3],[1,4],[2,4],[2,3],[2,2],[3,2],[3,3],[3,4]],
    },
  },

  // Puzzle 2 — 5×5, 4 colors
  // Grid:
  //  A A A A A
  //  B R G G A
  //  B R R G A
  //  B R G G A  ← note: (3,2)=R→(3,3) fills gap, green ends at (3,3)
  //  B B B B A
  {
    size: 5,
    colors: {
      amber: [[0,0],[4,4]],
      blue:  [[1,0],[4,3]],
      red:   [[1,1],[3,1]],
      green: [[1,2],[3,3]],
    },
    solution: {
      amber: [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4],[3,4],[4,4]],
      blue:  [[1,0],[2,0],[3,0],[4,0],[4,1],[4,2],[4,3]],
      red:   [[1,1],[2,1],[2,2],[3,2],[3,1]],
      green: [[1,2],[1,3],[2,3],[3,3]],
    },
  },

  // Puzzle 3 — 5×5, 5 colors (vertical stripes)
  // Grid:
  //  A B G R P
  //  A B G R P
  //  A B G R P
  //  A B G R P
  //  A B G R P
  {
    size: 5,
    colors: {
      amber:  [[0,0],[4,0]],
      blue:   [[0,1],[4,1]],
      green:  [[0,2],[4,2]],
      red:    [[0,3],[4,3]],
      purple: [[0,4],[4,4]],
    },
    solution: {
      amber:  [[0,0],[1,0],[2,0],[3,0],[4,0]],
      blue:   [[0,1],[1,1],[2,1],[3,1],[4,1]],
      green:  [[0,2],[1,2],[2,2],[3,2],[4,2]],
      red:    [[0,3],[1,3],[2,3],[3,3],[4,3]],
      purple: [[0,4],[1,4],[2,4],[3,4],[4,4]],
    },
  },

  // Puzzle 4 — 5×5, 6 colors
  // Grid:
  //  A A A A A
  //  R P T T B
  //  R P T T B
  //  R P P P B
  //  G G G G B
  {
    size: 5,
    colors: {
      amber:  [[0,0],[0,4]],
      blue:   [[1,4],[4,4]],
      green:  [[4,0],[4,3]],
      red:    [[1,0],[3,0]],
      purple: [[1,1],[3,3]],
      teal:   [[1,2],[2,2]],
    },
    solution: {
      amber:  [[0,0],[0,1],[0,2],[0,3],[0,4]],
      blue:   [[1,4],[2,4],[3,4],[4,4]],
      green:  [[4,0],[4,1],[4,2],[4,3]],
      red:    [[1,0],[2,0],[3,0]],
      purple: [[1,1],[2,1],[3,1],[3,2],[3,3]],
      teal:   [[1,2],[1,3],[2,3],[2,2]],
    },
  },

  // Puzzle 5 — 6×6, 6 colors
  // Grid:
  //  A A A A A A
  //  B G G G G A
  //  B R R R G A
  //  B P P R G A
  //  B B P P G A
  //  T T T P P A
  {
    size: 6,
    colors: {
      amber:  [[0,0],[5,5]],
      blue:   [[1,0],[4,1]],
      green:  [[1,1],[4,4]],
      red:    [[2,1],[3,3]],
      purple: [[3,1],[5,4]],
      teal:   [[5,0],[5,2]],
    },
    solution: {
      amber:  [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[1,5],[2,5],[3,5],[4,5],[5,5]],
      blue:   [[1,0],[2,0],[3,0],[4,0],[4,1]],
      green:  [[1,1],[1,2],[1,3],[1,4],[2,4],[3,4],[4,4]],
      red:    [[2,1],[2,2],[2,3],[3,3]],
      purple: [[3,1],[3,2],[4,2],[4,3],[5,3],[5,4]],
      teal:   [[5,0],[5,1],[5,2]],
    },
  },
];

export const COLOR_MAP = {
  amber:  '#F5A623',
  blue:   '#4A9EFF',
  green:  '#22C55E',
  red:    '#EF4444',
  purple: '#A855F7',
  teal:   '#2DD4BF',
};
