# Polish Declension Flashcards

A spaced repetition flashcard app for learning Polish noun declensions. Built with React 19, TypeScript, and Tailwind CSS.

## Features

- **FSRS Spaced Repetition** — Uses the Free Spaced Repetition Scheduler algorithm (same as Anki) to optimize review timing
- **285 Flashcards** — Covering all 7 Polish cases across masculine, feminine, neuter nouns and pronouns
- **Smart Filtering** — Filter by case (Nominative, Genitive, etc.), gender, and number (singular/plural)
- **Practice Mode** — Drill cards without affecting your SRS progress
- **Offline-First** — All progress saved to localStorage
- **Configurable** — Set your own daily new card limit

## How It Works

### SRS Mode (Default)
1. Each day, you'll see due reviews plus new cards (default: 10/day)
2. After revealing the answer, rate your recall:
   - **Again** — Forgot completely (card repeats in session)
   - **Hard** — Struggled to remember
   - **Good** — Remembered with effort
   - **Easy** — Instantly recalled
3. The algorithm schedules your next review based on your rating
4. Filters only affect new cards — reviews always appear regardless of filter

### Practice Mode
- Toggle "Practice" in the header to drill cards without affecting SRS
- Cards are shuffled and loop infinitely
- Respects your current filters

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

## Tech Stack

- **React 19** + TypeScript
- **Vite** — Build tool
- **Tailwind CSS** — Styling
- **ts-fsrs** — Spaced repetition algorithm
- **localStorage** — Data persistence

## Project Structure

```
src/
├── components/
│   └── Flashcard.tsx    # Card display with rating buttons
├── data/
│   └── cards.json       # 285 flashcards
├── lib/
│   ├── scheduler.ts     # FSRS logic and session building
│   └── storage.ts       # localStorage persistence
├── types.ts             # TypeScript interfaces
└── App.tsx              # Main application
```

## Adding Cards

Edit `src/data/cards.json`. Each card has:

```json
{
  "id": 1,
  "front": "To jest ___ (nauczyciel).",
  "back": "To jest nauczyciel",
  "declined": "nauczyciel",
  "case": "Nominative",
  "gender": "Masculine",
  "number": "Singular",
  "hint": null
}
```

- `front` — Question with blank
- `back` — Complete answer
- `declined` — The declined word (highlighted in answer)
- `case` — One of: Nominative, Genitive, Dative, Accusative, Instrumental, Locative, Vocative
- `gender` — One of: Masculine, Feminine, Neuter, Pronoun
- `number` — Singular or Plural
- `hint` — Optional hint text
