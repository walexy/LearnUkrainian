# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Ukrainian language learning app grounded in modern second language acquisition research. Designed for a commuter with 365+ hours/year of listening time.

**Pedagogical Framework:**
- **Krashen's Input Hypothesis** - Acquisition through comprehensible input (i+1)
- **Spaced Repetition** (Ebbinghaus) - Optimal timing for review
- **Cognitive Load Theory** - Managing mental effort for effective learning
- **Zone of Proximal Development** (Vygotsky) - Scaffolding just beyond current ability
- **Desirable Difficulties** - Strategic challenges that enhance retention
- **Self-Determination Theory** - Intrinsic motivation through autonomy and competence

**Four main features:**
1. **Cyrillic Trainer** - Alphabet learning with mnemonics, recognition drills, reading practice, and progress tracking
2. **Listening Library** - Curated content organized by difficulty tiers (gateway → bridge → native) with pre-listening scaffolds
3. **Colleague Connection** - Interference patterns to understand Ukrainian-English language transfer
4. **Dashboard** - Unified progress view with milestones, achievements, word tracking, and MCP integration

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **State**: Zustand with localStorage persistence
- **Routing**: React Router DOM
- **Audio**: Web Speech Synthesis API (Ukrainian TTS)
- **AI Integration**: MCP server for Claude Desktop tutoring

## Build Commands

```bash
cd ukrainian-learner
npm install
npm run dev      # Development server (usually port 5173 or 5174)
npm run build    # Production build
npm run preview  # Preview production build
```

### MCP Server

```bash
cd ukrainian-learner/mcp-server
npm install
npm run build    # Compile TypeScript
npm run start    # Run server (for testing)
```

## Project Structure

```
ukrainian-learner/
├── public/data/           # JSON data files
│   ├── alphabet.json      # 33 letters with mnemonics
│   ├── content-library.json
│   ├── milestones.json
│   └── interference-patterns.json
├── mcp-server/            # MCP server for Claude Desktop
│   ├── src/
│   │   ├── index.ts       # Main server entry
│   │   ├── api-client.ts  # Reads progress from local file
│   │   ├── resources/     # MCP resources (profile, weak-areas, words)
│   │   └── tools/         # MCP tools (context, recommend)
│   └── package.json
└── src/
    ├── components/        # Shared UI components
    │   ├── Layout.jsx     # App shell with i18n navigation
    │   ├── ProgressBar.jsx
    │   ├── MilestoneToast.jsx
    │   ├── ComprehensionChart.jsx
    │   ├── ContextualHint.jsx
    │   ├── NextStepWidget.jsx
    │   └── WelcomeFlow.jsx
    ├── pages/             # Route components
    │   ├── Home.jsx
    │   ├── CyrillicTrainer.jsx
    │   ├── ListeningLibrary.jsx
    │   ├── ColleagueConnection.jsx
    │   └── Dashboard.jsx
    ├── features/          # Feature-specific components
    │   ├── cyrillic/
    │   │   ├── MnemonicCard.jsx
    │   │   ├── LetterDrill.jsx
    │   │   ├── LetterProgress.jsx
    │   │   └── ReadingDrill.jsx
    │   ├── listening/
    │   │   ├── ContentCard.jsx
    │   │   ├── ContentBrowser.jsx
    │   │   ├── SessionLogger.jsx
    │   │   ├── PreListeningScaffold.jsx
    │   │   └── WordCapture.jsx
    │   └── interference/
    │       └── PatternCard.jsx
    ├── stores/
    │   └── useProgressStore.js  # Zustand store (local-first)
    ├── hooks/
    │   ├── useAlphabet.js
    │   ├── useContent.js
    │   ├── useSpeech.js
    │   ├── useMilestones.js
    │   └── useInterferencePatterns.js
    └── utils/
        ├── shuffle.js
        └── i18n.js          # Ukrainian UI translations
```

## Key Design Principles

1. **Low friction** - Every click is a reason to skip practice
2. **No guilt** - App never mentions missed days
3. **Input over output** - Focus on comprehension, not quizzes
4. **Local-first** - No account required, data in localStorage
5. **Progressive immersion** - UI can switch to Ukrainian labels/full Ukrainian

## State Management

All user progress is stored in Zustand with localStorage persistence:
- `letterProgress` - Accuracy stats per letter
- `listeningSessions` - Array of logged listening sessions
- `totalListeningMinutes` - Cumulative listening time
- `acquiredWords` - Words encountered with frequency tracking
- `unlockedMilestones` - Array of milestone IDs
- `manualAchievements` - User-logged breakthrough moments
- `currentStreak` - Day streak counter
- `onboarding` - Welcome flow and hint tracking
- `uiSettings` - Ukrainian UI level preference

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

- `/` - Home page with quick stats, NextStepWidget, and WelcomeFlow
- `/cyrillic` - Cyrillic Trainer (Learn/Practice/Read/Progress tabs)
- `/listening` - Listening Library (Browse/Log/History tabs) with PreListeningScaffold
- `/colleague` - Colleague Connection (interference patterns)
- `/dashboard` - Full progress dashboard with milestones and MCP setup

## AI Tutor Integration

Two methods for personalized AI tutoring:

### Option 1: Claude.ai (Recommended)
From Dashboard → AI Tutor Setup → "Copy Progress for Claude.ai", paste into any Claude conversation. Works on any device, no setup required.

### Option 2: MCP Server (Advanced)
For Claude Desktop with automatic context:

**Resources exposed:**
- `learner://profile` - Letters mastered, listening hours, streak
- `learner://weakareas` - Struggling letters, comprehension gaps
- `learner://words` - Acquired vocabulary with frequency

**Tools available:**
- `generate_conversation_context` - Full learner context for tutoring
- `get_practice_recommendation` - Prioritized practice suggestions

**Setup:**
1. User exports progress.json from Dashboard
2. Saves to `~/.language-learner/progress.json`
3. MCP server reads this file when Claude Desktop connects

### Tutor Prompt
See [Claude Tutor Prompt](ukrainian-learner/docs/claude-tutor-prompt.md) for the full system prompt that guides AI tutoring sessions. Integrates all six pedagogical frameworks.

## Future: Cloud Sync (Planned)

Supabase integration planned for cross-device sync:
- Auth via email/Google/magic links
- Postgres database with Row-Level Security
- Real-time sync across mobile and desktop

## Documentation

- [Project Plan](docs/ukrainian-learning-app-plan.md) - Core philosophy, architecture, feature specs, and implementation roadmap
- [Claude Tutor Prompt](ukrainian-learner/docs/claude-tutor-prompt.md) - System prompt for AI tutoring with full pedagogical framework
- [Workflow Orchestration](docs/Workflow-Orchestration.md) - Planning guidelines, subagent strategy, and task management
