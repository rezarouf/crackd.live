# CLAUDE.md — Frontend Website Rules

## Always Do First
- **Invoke the `frontend-design` skill** before writing any frontend code, every session, no exceptions.

## Reference Images
- If a reference image is provided: match layout, spacing, typography, and color exactly. Swap in placeholder content (images via `https://placehold.co/`, generic copy). Do not improve or add to the design.
- If no reference image: design from scratch with high craft (see guardrails below).
- Screenshot your output, compare against reference, fix mismatches, re-screenshot. Do at least 2 comparison rounds. Stop only when no visible differences remain or user says so.

## Local Server
- **Always serve on localhost** — never screenshot a `file:///` URL.
- Start the dev server: `node serve.mjs` (serves the project root at `http://localhost:3000`)
- `serve.mjs` lives in the project root. Start it in the background before taking any screenshots.
- If the server is already running, do not start a second instance.

## Screenshot Workflow
- Puppeteer is installed at `C:/Users/nateh/AppData/Local/Temp/puppeteer-test/`. Chrome cache is at `C:/Users/nateh/.cache/puppeteer/`.
- **Always screenshot from localhost:** `node screenshot.mjs http://localhost:3000`
- Screenshots are saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- Optional label suffix: `node screenshot.mjs http://localhost:3000 label` → saves as `screenshot-N-label.png`
- `screenshot.mjs` lives in the project root. Use it as-is.
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Tailwind CSS via CDN: `<script src="https://cdn.tailwindcss.com"></script>`
- Placeholder images: `https://placehold.co/WIDTHxHEIGHT`
- Mobile-first responsive

## Brand Assets
- Always check the `assets` folder before designing. It may contain logos, color guides, style guides, or images.
- If assets exist there, use them. Do not use placeholders where real assets are available.
- If a logo is present, use it. If a color palette is defined, use those exact values — do not invent brand colors.

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color

---

# Crackd.live — Project Specific Rules

## IMPORTANT — Context & Token Efficiency
- Only open files directly relevant to the task
- Never scan or read the entire codebase
- Never read all game files when working on one game
- When fixing a bug, open ONLY the specific file mentioned
- Always confirm which single file to edit before making changes
- Do not re-read game logic when making UI changes
- Do not re-read all games when working on one specific game

---

## Design System (Never Change These Values)
- Background:     #0D0F14
- Surface/Cards:  #161B25
- Accent Amber:   #F5A623  (primary CTA, highlights, streaks)
- Accent Blue:    #4A9EFF  (info, links, secondary)
- Success Green:  #22C55E  (correct answers, completed)
- Danger Red:     #EF4444  (wrong answers, errors)
- Text Primary:   #F0F0F0
- Text Secondary: #8B95A1
- Font UI:        Inter
- Font Tiles:     JetBrains Mono
- Logo:           CRACKD.L⚡VE (lightning bolt replaces I in LIVE)

---

## Project Root
C:\Users\DELL\Documents\Projects\crackd-live\

## Key Config Files
- vite.config.js
- tailwind.config.js
- postcss.config.js
- src/main.jsx
- src/App.jsx
- src/constants.js

---

## Pages
- src/pages/Home.jsx
- src/pages/Games.jsx
- src/pages/Leaderboard.jsx
- src/pages/Profile.jsx
- src/pages/Login.jsx
- src/pages/Signup.jsx
- src/pages/Admin.jsx
- src/pages/Brand.jsx
- src/pages/Mobile.jsx
- src/pages/ScrewPuzzle.jsx
- src/pages/Wordle.jsx

## Layout & UI Components
- src/components/layout/Navbar.jsx
- src/components/layout/PageWrapper.jsx
- src/components/layout/ProtectedRoute.jsx
- src/components/ui/Badge.jsx
- src/components/ui/Button.jsx
- src/components/ui/GameShell.jsx
- src/components/ui/HintSolveBar.jsx
- src/components/ui/HowToPlay.jsx
- src/components/ui/Logo.jsx
- src/components/ui/Modal.jsx
- src/components/ui/Toast.jsx
- src/components/ui/XPBar.jsx
- src/components/ErrorBoundary.jsx
- src/components/LogoMark.jsx
- src/components/Nav.jsx

## Store & Hooks
- src/store/authStore.js       (Zustand auth state)
- src/store/gameStore.js       (Zustand game state)
- src/hooks/useAchievements.js
- src/hooks/useConfetti.js
- src/hooks/useDailyChallenge.js

## Lib / Utilities
- src/lib/supabase.js
- src/lib/constants.js
- src/lib/utils.js

---

## Games Directory
Each game: [GameName]Game.jsx + use[GameName].js + optional data file

### Word & Number Games
- src/games/wordle/          → WordleGame.jsx, useWordle.js, wordbank.js
- src/games/connections/     → ConnectionsGame.jsx, useConnections.js, puzzles.js
- src/games/nerdle/          → NerdleGame.jsx, useNerdle.js
- src/games/cryptogram/      → CryptogramGame.jsx, useCryptogram.js, quotes.js
- src/games/sudoku/          → SudokuGame.jsx, useSudoku.js, sudokuGenerator.js
- src/games/spellingbee/     → SpellingBeeGame.jsx, useSpellingBee.js, spellingbeeData.js
- src/games/wordladder/      → WordLadderGame.jsx, useWordLadder.js, wordladderData.js

### Visual / Puzzle Games
- src/games/screw/           → ScrewPuzzleGame.jsx, useScrewPuzzle.js
- src/games/pinpull/         → PinPullGame.jsx, usePinPull.js
- src/games/rope/            → RopeUntangleGame.jsx, useRopeUntangle.js
- src/games/woodblock/       → WoodBlockGame.jsx, useWoodBlock.js
- src/games/nutsbolts/       → NutsAndBoltsGame.jsx, useNutsAndBolts.js
- src/games/watersort/       → WaterSortGame.jsx, useWaterSort.js
- src/games/tilerotation/    → TileRotationGame.jsx, useTileRotation.js
- src/games/flow/            → FlowGame.jsx, useFlow.js, flowData.js

### Bonus Games
- src/games/minesweeper/     → MinesweeperGame.jsx, useMinesweeper.js
- src/games/twentyfortyeight/→ Game2048.jsx, use2048.js
- src/games/merge/           → MergeGame.jsx, useMerge.js
- src/games/emojiphrase/     → EmojiPhraseGame.jsx, useEmojiPhrase.js, emojiPhraseData.js
- src/games/nonogram/        → NonogramGame.jsx, useNonogram.js

---

## Design Reference Files (Read Only — Never Edit)
- crackd-live/project/pages/Home.jsx
- crackd-live/project/pages/Games.jsx
- crackd-live/project/pages/Wordle.jsx
- crackd-live/project/pages/Leaderboard.jsx
- crackd-live/project/pages/Profile.jsx
- crackd-live/project/pages/ScrewPuzzle.jsx
- crackd-live/project/pages/Brand.jsx
- crackd-live/project/pages/Mobile.jsx
- crackd-live/project/components/Nav.jsx

---

## Efficient Prompt Templates

### Bug fix (use this exact format):
"In `src/games/wordle/useWordle.js` only,
fix [specific issue]. Do not open any other files."

### UI change (use this exact format):
"In `src/components/layout/Navbar.jsx` only,
change [element] from [x] to [y]. Do not open any other files."

### New feature (use this exact format):
"Add [feature] to `src/pages/Home.jsx`.
The only other file you may need is `src/store/gameStore.js`."

### Design match (use this exact format):
"In `src/pages/Leaderboard.jsx` only,
match the layout from `crackd-live/project/pages/Leaderboard.jsx`.
Do not open any other files."

---

## Daily Usage Protection Rules
- Use /compact every 5 prompts
- Use /clear between unrelated tasks
- Never run file scanning commands inside Claude Code
- Always name the exact file in every prompt
- Start a fresh session for each separate feature

## After editing a file:
- Do not re-read the file to verify
- Trust your edits and stop
- Only re-read if the user reports it still broken

## Token Saving Rules
- Fix ONE issue per prompt, never combine multiple bugs
- After editing a file do NOT re-read it to verify
- Never read WordLadderGame.jsx, WordleGame.jsx or any 
  Game UI file when the bug is in the hook/logic file
- Data files (wordbank.js, quotes.js, puzzles.js, 
  wordladderData.js, flowData.js) are large — only open 
  them when the task specifically requires it
- Do not attach screenshots unless layout is broken

## Flow Game — Special Rules
- useFlow.js is 8,679 bytes — never read the full file at once
- Always read specific functions only using line ranges
- When fixing Flow bugs:
  Step 1: Read only the broken function by line range
  Step 2: Fix only that function
  Never read FlowGame.jsx for logic bugs
  Never read all 3 flow files in the same prompt

## Large Files — Never Read Fully
These files must only be read by specific line range or function:
- src/games/flow/useFlow.js (8,679 bytes)
- src/games/wordle/wordbank.js
- src/games/wordladder/wordladderData.js
- src/games/cryptogram/quotes.js
- src/games/connections/puzzles.js
- src/games/sudoku/sudokuGenerator.js

## Session History Rule
- If current session has more than 5 exchanges use /clear
- Long conversation history adds cost to every prompt
- Fresh sessions are always cheaper
- Never carry a long session across multiple bug fixes

## Multi-Bug Rule — CRITICAL
- Never report multiple bugs in one prompt
- One bug = one prompt = one session
- If you have 3 bugs, fix them on 3 separate days
- Combining bugs forces Claude to read multiple files

## Screenshot Rule
- Never attach a screenshot unless the bug is purely visual
- Logic bugs, wrong answers, broken game mechanics = no screenshot needed
- Screenshots add significant token cost on top of file reads

## Permission Rule
- Never ask for permission before reading or editing files
- Never ask "should I also check X file?"
- Never ask "do you want me to also fix Y?"
- Just do the single task and stop

## Stop Rule — CRITICAL
- After completing the requested fix, STOP immediately
- Do not suggest follow-up improvements
- Do not offer to fix related issues
- Do not do a "final verification read"
- Do not summarize what you changed in more than 3 lines
- Just fix the one thing and stop

## Daily Usage Hard Limits
- Stop all work when session hits 50% daily usage
- Never attempt a complex fix (algorithm rewrite, new feature) 
  if current usage is above 40%
- Save complex tasks for the start of a fresh day at 100%
- Simple fixes only (color, text, single function) when above 60%

## Complexity Guide — Know Before Starting
Simple fix (1-2% usage):
- Color or style change in one component
- Text or copy change
- Single line bug fix

Medium fix (3-5% usage):
- Single function rewrite
- One hook logic fix
- Adding one new UI element

Complex fix (8-15% usage):
- Algorithm rewrite (backtracking, BFS, solver)
- New game feature end to end
- Multiple functions across one file
→ Only attempt at start of day with 100% usage

Never attempt (too expensive, split across days):
- Fixing multiple bugs in one prompt
- Rewriting an entire game file
- Adding a new game from scratch mid-session

## File Size Map — Read Limits

### RED files (10,000+ bytes) — Read ONE at a time, never combine:
- src/pages/Home.jsx                        (19,059 bytes)
- src/components/ui/HowToPlay.jsx           (16,867 bytes)
- src/games/wordle/wordbank.js              (16,227 bytes)
- src/components/layout/Navbar.jsx          (13,641 bytes)
- src/pages/Admin.jsx                       (11,720 bytes)
- src/pages/Mobile.jsx                      (11,717 bytes)
- src/pages/ScrewPuzzle.jsx                 (11,235 bytes)
- src/games/sudoku/SudokuGame.jsx           (11,126 bytes)
- src/pages/Brand.jsx                       (11,075 bytes)
- src/pages/Profile.jsx                     (10,900 bytes)
- src/games/wordle/WordleGame.jsx           (10,690 bytes)
- src/pages/Wordle.jsx                      (10,300 bytes)
- src/pages/Games.jsx                       (10,211 bytes)
- src/pages/Leaderboard.jsx                  (9,895 bytes)

### YELLOW files (5,000–10,000 bytes) — OK alone, never combine two RED+YELLOW:
- src/games/wordle/useWordle.js              (9,147 bytes)
- src/games/flow/useFlow.js                  (8,679 bytes)
- src/pages/Signup.jsx                       (8,012 bytes)
- src/games/woodblock/WoodBlockGame.jsx      (7,958 bytes)
- src/games/woodblock/useWoodBlock.js        (7,501 bytes)
- src/games/wordladder/wordladderData.js     (7,178 bytes)
- src/games/nerdle/useNerdle.js              (7,177 bytes)
- src/games/rope/RopeUntangleGame.jsx        (7,010 bytes)
- src/games/pinpull/PinPullGame.jsx          (6,709 bytes)
- src/games/sudoku/useSudoku.js              (6,580 bytes)
- src/games/connections/ConnectionsGame.jsx  (6,569 bytes)
- src/games/twentyfortyeight/Game2048.jsx    (6,437 bytes)
- src/games/screw/ScrewPuzzleGame.jsx        (6,240 bytes)
- src/games/screw/useScrewPuzzle.js          (6,236 bytes)
- src/games/rope/useRopeUntangle.js          (6,172 bytes)
- src/games/cryptogram/CryptogramGame.jsx    (6,147 bytes)
- src/games/spellingbee/SpellingBeeGame.jsx  (6,097 bytes)
- src/games/connections/useConnections.js    (5,894 bytes)
- src/games/minesweeper/useMinesweeper.js    (5,892 bytes)
- src/lib/constants.js                       (5,860 bytes)
- src/games/nutsbolts/NutsAndBoltsGame.jsx   (5,860 bytes)
- src/games/nutsbolts/useNutsAndBolts.js     (5,824 bytes)
- src/games/twentyfortyeight/use2048.js      (5,817 bytes)
- src/games/nerdle/NerdleGame.jsx            (5,720 bytes)
- src/games/pinpull/usePinPull.js            (5,567 bytes)
- src/games/wordladder/WordLadderGame.jsx    (5,495 bytes)
- src/App.jsx                                (5,411 bytes)
- src/games/spellingbee/useSpellingBee.js    (5,302 bytes)
- src/games/emojiphrase/EmojiPhraseGame.jsx  (5,226 bytes)
- src/games/flow/FlowGame.jsx                (5,066 bytes)
- src/components/ui/HintSolveBar.jsx         (5,054 bytes)

### GREEN files (under 5,000 bytes) — Safe to read freely:
- Everything else in the project

## Combination Rules
- Never read 2 RED files in same prompt
- Never read 1 RED + 2 YELLOW files in same prompt
- Never read wordbank.js (16,227) with ANY other large file
- For Wordle bugs: useWordle.js only — never open WordleGame.jsx or wordbank.js together
- For Sudoku bugs: useSudoku.js only — never open SudokuGame.jsx together
- For Navbar bugs: Navbar.jsx only — never open any page file together
- For Home bugs: Home.jsx only — nothing else