export const QUOTES = [
  { text: 'THE ONLY WAY TO DO GREAT WORK IS TO LOVE WHAT YOU DO', author: 'Steve Jobs', difficulty: 'Easy', category: 'inspiration' },
  { text: 'IN THE MIDDLE OF EVERY DIFFICULTY LIES OPPORTUNITY', author: 'Albert Einstein', difficulty: 'Medium', category: 'philosophy' },
  { text: 'IT ALWAYS SEEMS IMPOSSIBLE UNTIL IT IS DONE', author: 'Nelson Mandela', difficulty: 'Easy', category: 'motivation' },
  { text: 'LIFE IS WHAT HAPPENS WHEN YOU ARE BUSY MAKING OTHER PLANS', author: 'John Lennon', difficulty: 'Medium', category: 'life' },
  { text: 'THE FUTURE BELONGS TO THOSE WHO BELIEVE IN THE BEAUTY OF THEIR DREAMS', author: 'Eleanor Roosevelt', difficulty: 'Hard', category: 'inspiration' },
  { text: 'TWO ROADS DIVERGED IN A WOOD AND I TOOK THE ONE LESS TRAVELED BY', author: 'Robert Frost', difficulty: 'Hard', category: 'literature' },
  { text: 'ASK NOT WHAT YOUR COUNTRY CAN DO FOR YOU', author: 'John F. Kennedy', difficulty: 'Easy', category: 'history' },
  { text: 'IMAGINATION IS MORE IMPORTANT THAN KNOWLEDGE', author: 'Albert Einstein', difficulty: 'Medium', category: 'science' },
  { text: 'THAT WHICH DOES NOT KILL US MAKES US STRONGER', author: 'Friedrich Nietzsche', difficulty: 'Medium', category: 'philosophy' },
  { text: 'TO BE OR NOT TO BE THAT IS THE QUESTION', author: 'William Shakespeare', difficulty: 'Easy', category: 'literature' },
  { text: 'NOT ALL THOSE WHO WANDER ARE LOST', author: 'J.R.R. Tolkien', difficulty: 'Easy', category: 'literature' },
  { text: 'DO NOT GO GENTLE INTO THAT GOOD NIGHT', author: 'Dylan Thomas', difficulty: 'Medium', category: 'literature' },
  { text: 'WE ARE ALL MADE OF STAR STUFF', author: 'Carl Sagan', difficulty: 'Easy', category: 'science' },
  { text: 'THE UNIVERSE IS UNDER NO OBLIGATION TO MAKE SENSE TO YOU', author: 'Neil deGrasse Tyson', difficulty: 'Hard', category: 'science' },
  { text: 'I THINK THEREFORE I AM', author: 'René Descartes', difficulty: 'Easy', category: 'philosophy' },
  { text: 'KNOWLEDGE IS POWER', author: 'Francis Bacon', difficulty: 'Easy', category: 'philosophy' },
  { text: 'A PENNY SAVED IS A PENNY EARNED', author: 'Benjamin Franklin', difficulty: 'Easy', category: 'humor' },
  { text: 'THE REPORTS OF MY DEATH HAVE BEEN GREATLY EXAGGERATED', author: 'Mark Twain', difficulty: 'Hard', category: 'humor' },
];

export function generateCipher(seed = Math.random()) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const shuffled = [...alphabet];
  // Seeded shuffle
  let s = seed * 1000000 | 0;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = ((s * 1664525) + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Ensure no letter maps to itself
  for (let i = 0; i < alphabet.length; i++) {
    if (shuffled[i] === alphabet[i]) {
      const next = (i + 1) % alphabet.length;
      [shuffled[i], shuffled[next]] = [shuffled[next], shuffled[i]];
    }
  }
  const encode = {}, decode = {};
  alphabet.forEach((letter, i) => {
    encode[letter] = shuffled[i];
    decode[shuffled[i]] = letter;
  });
  return { encode, decode };
}

export function encodeText(text, cipher) {
  return text.split('').map(c => cipher.encode[c] || c).join('');
}

export function getDailyQuote() {
  const d = new Date();
  const idx = (d.getDate() * 7 + d.getMonth()) % QUOTES.length;
  return QUOTES[idx];
}
