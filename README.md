# GameKnight

A dark-mode, single-screen host console for small quiz games. Starts with a working Jeopardy clone; more formats land in the library over time.

- **Stack:** Vite + React 18 + TypeScript + Tailwind CSS + Zustand
- **Persistence:** browser only (localStorage). No backend, no accounts.
- **Mode:** single-screen presenter. Host runs the app on a TV or laptop; players answer in the room while the host reveals questions and awards points.

## Quick start

```bash
npm install
npm run dev
```

Open the printed URL. Click **Jeopardy**, then **Download sample** in the importer to grab `sample-quiz.csv`. Re-import it, name your players, and **Start game**.

## Build

```bash
npm run build      # type-check + production build
npm run preview    # serve the build locally
npm run lint       # type-check only
```

## CSV format

A Jeopardy quiz is a single CSV with a header row and exactly **30 data rows** — 6 categories × 5 values each.

```csv
category,value,question,answer
World Capitals,100,The capital of France,Paris
World Capitals,200,The capital of Australia (not Sydney),Canberra
...
```

Rules enforced by the importer:

| Rule                                   | Detail                                                                      |
| -------------------------------------- | --------------------------------------------------------------------------- |
| Header row                             | Exactly `category,value,question,answer` (case-insensitive).                |
| 30 data rows                           | 6 categories × 5 values per category.                                       |
| Allowed values                         | `100`, `200`, `300`, `400`, `500`. Each appears once per category.          |
| Non-empty `category`/`question`/`answer` | Trim-checked.                                                              |
| Quoting                                | Standard CSV. Wrap fields containing commas in double quotes.               |

If a CSV doesn't validate, the importer lists every problem with the row number — fix in your editor and re-import.

## Game flow

1. **Library** (`/`) — pick a game. Only **Jeopardy** is implemented; the others are placeholders.
2. **Admin** (`/jeopardy`) — import a CSV, manage saved quizzes (rename / duplicate / export / delete), enter 2–6 player names, hit **Start**.
3. **Board** (`/jeopardy/play`) — click a value to reveal its question, **Space** or click to reveal the answer, then **+value** / **−value** for the player who got it (or **Esc** to go back without scoring). Each player tile in the bottom score bar is also click-to-edit if you need to override.
4. **Resume after refresh** — the in-progress game persists in `localStorage`. The admin page surfaces a "Resume / Discard" banner when one exists.

## Keyboard shortcuts

| Key   | Action                                            |
| ----- | ------------------------------------------------- |
| Space | Reveal the answer (while a question is showing).  |
| Esc   | Close the question without awarding points.       |

## File layout

```
src/
  routes/                 # HomePage, JeopardyAdminPage, JeopardyBoardPage, PlaceholderPage
  components/
    ui/                   # Button, Card, Modal, Input, IconButton, Toast, Badge
    library/              # GameTile
    jeopardy/             # CsvImporter, QuizList, PlayerSetup, BoardGrid, BoardCell, QuestionView, ScoreBar
    Layout.tsx
  games/jeopardy/
    types.ts
    constants.ts
    csv.ts                # papaparse + strict validator
    store.ts              # Zustand + persist
  lib/
    storage.ts            # quiz library localStorage helpers
    colors.ts             # player accent palette
    cn.ts                 # clsx + tailwind-merge
public/
  sample-quiz.csv
```

## Storage keys

- `gk:quizzes:v1` — quiz library
- `gk:jeopardy:game:v1` — in-progress game state

Clearing site data wipes both.

## Roadmap (out of scope for this MVP)

- Multi-device / networked play
- Daily Doubles, Final Jeopardy, two-round mode
- Real implementations of Trivia / Millionaire / Buzzer Round
- Accounts / cloud sync

The code is structured so each can slot in without rework — every game lives under `src/games/<slug>/` and gets its own routes and components.
