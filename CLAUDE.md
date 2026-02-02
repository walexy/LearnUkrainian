# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Ukrainian language learning app focused on Krashen's Input Hypothesis - acquisition through comprehensible input rather than conscious study. Designed for a commuter with 365+ hours/year of listening time.

Three main features:
1. **Cyrillic Trainer** - Alphabet learning with mnemonics, recognition drills, and progress tracking
2. **Listening Library** - Curated content organized by difficulty tiers (gateway → bridge → native)
3. **Dashboard** - Unified progress view with milestones and achievements

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand with localStorage persistence
- **Routing**: React Router DOM
- **Audio**: Web Speech Synthesis API (Ukrainian TTS)

## Build Commands

```bash
cd ukrainian-learner
npm install
npm run dev      # Development server (usually port 5173 or 5174)
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure

```
ukrainian-learner/
├── public/data/           # JSON data files
│   ├── alphabet.json      # 33 letters with mnemonics
│   ├── content-library.json
│   ├── milestones.json
│   └── interference-patterns.json
└── src/
    ├── components/        # Shared UI components
    │   ├── Layout.jsx     # App shell with navigation
    │   ├── ProgressBar.jsx
    │   └── MilestoneToast.jsx
    ├── pages/             # Route components
    │   ├── Home.jsx
    │   ├── CyrillicTrainer.jsx
    │   ├── ListeningLibrary.jsx
    │   └── Dashboard.jsx
    ├── features/          # Feature-specific components
    │   ├── cyrillic/
    │   │   ├── MnemonicCard.jsx
    │   │   ├── LetterDrill.jsx
    │   │   └── LetterProgress.jsx
    │   └── listening/
    │       ├── ContentCard.jsx
    │       ├── ContentBrowser.jsx
    │       └── SessionLogger.jsx
    ├── stores/
    │   └── useProgressStore.js  # Zustand store
    ├── hooks/
    │   ├── useAlphabet.js   # Fetch alphabet data
    │   ├── useContent.js    # Fetch content library
    │   ├── useSpeech.js     # Web Speech API wrapper
    │   └── useMilestones.js # Milestone checking
    └── utils/
        └── shuffle.js       # Fisher-Yates shuffle
```

## Key Design Principles

1. **Low friction** - Every click is a reason to skip practice
2. **No guilt** - App never mentions missed days
3. **Input over output** - Focus on comprehension, not quizzes
4. **Local-first** - No account required, data in localStorage

## State Management

All user progress is stored in Zustand with localStorage persistence:
- `letterProgress` - Accuracy stats per letter
- `listeningSessions` - Array of logged listening sessions
- `totalListeningMinutes` - Cumulative listening time
- `unlockedMilestones` - Array of milestone IDs
- `currentStreak` - Day streak counter

## Letter Categories

Ukrainian Cyrillic letters are learned in phases:
- Phase 1 (instant): А, О, К, М, Т, І, Е - look/sound like Latin
- Phase 2 (false friends): В, Н, Р, С, У, Х - look familiar, different sounds
- Phase 3 (new shapes): Б, Г, Д, Л, П, Ф, З, Ч, Ш
- Phase 4 (complex): Ж, Ц, Щ, И, Ю, Я
- Phase 5 (specials): Є, Ї, Й, Ґ, Ь

## Content Tiers

- **Gateway** (weeks 1-8): Learner podcasts, Easy Languages, children's content
- **Bridge** (months 2-6): Ukrainer docs, news with subs, Servant of the People
- **Native** (month 6+): Radio Svoboda, Hromadske TV, full-speed content

## Routes

- `/` - Home page with quick stats and navigation
- `/cyrillic` - Cyrillic Trainer (Learn/Practice/Progress tabs)
- `/listening` - Listening Library (Browse/Log/History tabs)
- `/dashboard` - Full progress dashboard with milestones
