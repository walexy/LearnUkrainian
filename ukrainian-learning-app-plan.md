# Ukrainian Learning App Plan
## Personal Acquisition-Based Learning Tool

---

## Core Philosophy

This app embodies Krashen's Input Hypothesis: **acquisition happens through comprehensible input, not conscious study**. Every feature serves one purpose—maximize quality input time while keeping the affective filter low.

Your specific advantage: **365+ hours/year of commute listening time**. This app helps you use that time effectively.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Ukrainian Learning App                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │  CYRILLIC       │         │  LISTENING      │           │
│  │  TRAINER        │         │  LIBRARY        │           │
│  │                 │         │                 │           │
│  │  • Alphabet     │         │  • Curated      │           │
│  │    mnemonics    │         │    content      │           │
│  │  • Recognition  │         │  • Difficulty   │           │
│  │    drills       │         │    levels       │           │
│  │  • Reading      │         │  • Progress     │           │
│  │    practice     │         │    tracking     │           │
│  └────────┬────────┘         └────────┬────────┘           │
│           │                           │                     │
│           └───────────┬───────────────┘                     │
│                       │                                     │
│           ┌───────────▼───────────┐                        │
│           │   PROGRESS DASHBOARD   │                        │
│           │                        │                        │
│           │  • Hours logged        │                        │
│           │  • Comprehension %     │                        │
│           │  • Streaks & milestones│                        │
│           └────────────────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature 1: Cyrillic Trainer

### Why First
You can't absorb written input if you're still decoding letters. This is the "unlock" that makes everything else possible. Goal: **2-3 weeks to reading fluency**.

### The Alphabet Strategy

Ukrainian Cyrillic has 33 letters. They fall into four categories:

| Category | Letters | Strategy |
|----------|---------|----------|
| **Familiar Friends** | А, Е, І, О, К, М, Т | Look like Latin, sound similar—instant wins |
| **False Friends** | В, Н, Р, С, У, Х | Look familiar but sound different—need rewiring |
| **New but Learnable** | Б, Г, Д, Ж, З, Л, П, Ф, Ш, Щ, Ч, Ц | New shapes, but consistent sounds |
| **Ukrainian Specials** | Ї, Є, Ґ, Й, Ь | Unique to Ukrainian—learn with context |

### Feature Specs

#### 1. Mnemonic Cards
Each letter gets a memorable hook:
- **Visual**: Image that links shape to sound
- **Story**: One sentence that sticks
- **Audio**: Native pronunciation
- **Example word**: Common word starting with that letter

```
Example Card: Д (sounds like "D")

Visual: Looks like a house (Дім = home/house)
Mnemonic: "The Door to the Дім"
Audio: [native speaker saying "duh"]
Example: Дякую (dyakuyu) = Thank you
```

#### 2. Recognition Drills
Three modes, progressive difficulty:

**Mode A: Letter → Sound** (easiest)
- See: Д
- Hear four options, pick correct sound
- Builds recognition without production pressure

**Mode B: Sound → Letter**
- Hear: "duh"
- See four letters, pick correct one
- Reverses the mapping

**Mode C: Reading Practice**
- See: КИЇВ
- Try to sound it out
- Reveal pronunciation + meaning
- Real words from day one

#### 3. Progress Tracking
- Letters mastered (>90% accuracy over 3 sessions)
- Current weak spots (auto-surfaces for review)
- Reading speed benchmark (words per minute)

### Data Model

```javascript
// Letter schema
{
  letter: "Д",
  latinEquivalent: "D",
  category: "new_learnable",
  mnemonic: {
    visual: "/images/mnemonics/d-house.svg",
    story: "The Door to the Дім (home)",
    audio: "/audio/letters/d.mp3"
  },
  exampleWords: [
    { word: "Дякую", transliteration: "dyakuyu", meaning: "thank you" },
    { word: "Дім", transliteration: "dim", meaning: "home/house" }
  ]
}

// User progress schema
{
  odUserId: "user_123",
  letterProgress: {
    "Д": {
      correctCount: 45,
      totalAttempts: 52,
      lastPracticed: "2026-02-01T10:30:00Z",
      mastered: true
    }
  },
  sessionsCompleted: 12,
  currentStreak: 5
}
```

---

## Feature 2: Listening Library

### Philosophy
This is where acquisition actually happens. The Cyrillic Trainer is a prerequisite; the Listening Library is the main event.

Key insight: **You don't need to understand everything**. You need comprehensible input at i+1 (just slightly above your level). The app helps you find and track that sweet spot.

### Content Curation Strategy

#### Tier 1: Gateway Content (Weeks 1-8)
- **Ukrainian music with lyrics displayed**: Emotional engagement, repetition
- **Children's content**: Simple vocabulary, clear pronunciation
- **Slow Ukrainian podcasts**: Designed for learners

#### Tier 2: Bridge Content (Months 2-6)
- **Ukraїner documentaries**: Your historical interests + real Ukrainian
- **News in slow Ukrainian**: Current events, controlled speed
- **Podcasts with transcripts**: Can read along when needed

#### Tier 3: Native Content (Month 6+)
- **Ukrainian YouTube channels**: Topics you'd watch in English anyway
- **Ukrainian podcasts**: Full speed, no accommodations
- **Ukrainian audiobooks**: Extended narrative input

### Feature Specs

#### 1. Content Cards
Each piece of content gets metadata:

```javascript
{
  id: "ukrainer_ep_42",
  title: "The Bandura Makers of Chernihiv",
  source: "Ukraїner",
  url: "https://youtube.com/...",
  type: "documentary",
  tier: 2,
  duration: 847, // seconds
  topics: ["music", "crafts", "history", "chernihiv"],
  difficulty: {
    speed: "moderate",
    vocabulary: "intermediate",
    accent: "standard"
  },
  hasSubtitles: true,
  hasTranscript: true,
  recommended: true,
  notes: "Great for historical interests. Clear speech, beautiful visuals."
}
```

#### 2. Listening Session Tracker
Before/after each session:

**Pre-session:**
- Select content
- Set intention (casual listen vs. focused)
- Note current energy/focus level

**Post-session:**
- How much did you understand? (slider: 0-100%)
- Any words that stood out? (optional capture)
- Would you listen again? (helps refine recommendations)
- Auto-log duration

#### 3. Comprehension Journey
Visual timeline showing:
- Hours listened (cumulative)
- Average comprehension % over time
- Tier progression
- Milestone celebrations (50 hours, 100 hours, etc.)

### The "Commute Mode" Special Feature

Since your primary input time is driving:

- **Queue system**: Pre-load a playlist for tomorrow's commute
- **No-look controls**: Big play/pause, simple skip
- **Voice bookmarks**: Say "bookmark" to flag a moment to revisit
- **Offline support**: Downloaded content for dead zones

---

## Tech Stack Recommendation

### Frontend
**React + Vite**
- Fast development, hot reload
- Component-based (perfect for cards, drills)
- Huge ecosystem for audio players, charts

### Styling
**Tailwind CSS**
- Rapid prototyping
- Mobile-responsive out of the box
- Consistent design without bikeshedding

### State Management
**Zustand** (or just React Context)
- Lightweight, no boilerplate
- Perfect for this scale
- Easy localStorage persistence

### Data Storage
**Start with localStorage + JSON files**
- No backend needed initially
- Export/import for backup
- Graduate to SQLite or Supabase later if needed

### Audio/Video
**React Player** (for YouTube embeds)
**Howler.js** (for local audio files)

### Hosting
**Vercel or Netlify**
- Free tier is generous
- Deploy on git push
- Custom domain easy

---

## Implementation Roadmap

### Phase 0: Foundation (1 weekend)
- [ ] Set up Vite + React + Tailwind project
- [ ] Create basic navigation structure
- [ ] Set up localStorage persistence utilities
- [ ] Design basic component library (buttons, cards, progress bars)

### Phase 1: Cyrillic Trainer MVP (1-2 weeks)
- [ ] Create letter data file (all 33 letters with mnemonics)
- [ ] Build mnemonic card component
- [ ] Build letter recognition drill (Mode A only)
- [ ] Add basic progress tracking
- [ ] Deploy and start using!

### Phase 2: Listening Library MVP (1-2 weeks)
- [ ] Create content database (start with 20-30 curated items)
- [ ] Build content card browser
- [ ] Build session logging flow
- [ ] Add comprehension tracking
- [ ] Basic progress dashboard

### Phase 3: Polish & Integrate (1 week)
- [ ] Unified dashboard showing both modules
- [ ] Streak tracking
- [ ] Data export/import
- [ ] Mobile responsive polish

### Phase 4: Quality of Life (ongoing)
- [ ] Add more letter drill modes (B and C)
- [ ] Expand content library
- [ ] Add "commute mode" features
- [ ] Voice bookmarks (if technically feasible)

---

## Data Files to Create

### `/data/alphabet.json`
All 33 letters with mnemonics, audio paths, example words

### `/data/content-library.json`
Curated listening content with metadata

### `/data/milestones.json`
Celebration moments (50 hours, first Tier 2 content, etc.)

---

## Design Principles

1. **Low friction > feature-rich**: Every extra click is a reason to skip today's practice
2. **Celebrate progress**: Language acquisition is slow—make small wins visible
3. **No guilt**: Missed a day? The app doesn't mention it. Just shows "Ready when you are"
4. **Comprehension over production**: This app is about input, not output quizzes
5. **Your data is yours**: Easy export, no account required, runs locally

---

## Quick Start Commands

```bash
# Create the project
npm create vite@latest ukrainian-learner -- --template react
cd ukrainian-learner

# Add dependencies
npm install zustand howler react-player
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Start development
npm run dev
```

---

## Next Steps

1. **Review this plan**—does it match your vision?
2. **Start Phase 0**—get the project scaffolded
3. **Create `/data/alphabet.json`**—I can help generate this with mnemonics
4. **Build the first card component**—ship something usable fast

Want me to generate the alphabet data file with mnemonics, or scaffold the initial project structure?
