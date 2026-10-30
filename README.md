# DevArena — Angular Frontend

> **DevArena** is an algorithmic learning and deliberate coding practice platform combining the focused problem-solving mechanics of LeetCode & NeetCode with the calm, editorial visual hierarchy and craftsmanship of the official NestJS documentation website.

---

## 🎨 Visual Direction & Design Tokens

DevArena adheres to an editorial, developer-focused aesthetic:
- **Warm off-white background** (`#FAFAF9` in Light mode) and soft, balanced dark neutrals (`#111215` in Dark mode — no pure harsh black).
- **Subtle borders** (`#E7E5E4` / `#27282F`) with restrained 1px divider lines.
- **NestJS Coral/Red Brand Accent** (`#E0234E` / `#FB7185`) used sparingly for primary actions, active indicators, and brand highlights.
- **Semantic Muted Difficulty Badges**:
  - **Easy**: `#15803D` on `rgba(22, 163, 74, 0.10)`
  - **Medium**: `#B45309` on `rgba(217, 119, 6, 0.10)`
  - **Hard**: `#B91C1C` on `rgba(220, 38, 38, 0.10)`
- **Typography**: Inter for editorial UI clarity; JetBrains Mono for syntax-highlighted code blocks, testcase displays, and terminal execution outputs.

---

## 🛠 Tech Stack & Architecture

- **Framework**: Angular 19 (Standalone Components, Signals, Reactive State, Angular Router with View Transitions).
- **Forms**: Angular Reactive Forms with strict validation & custom error messaging.
- **Icons**: Scalable, high-precision Lucide SVG icon system (`<app-icon>`).
- **REST API Integration**: Typed HTTP client configured for NestJS backend (`/auth`, `/problems`, `/submissions/run`, `/submissions/submit`).
- **Resilience Engine**: Built-in mock data fallback so users can practice and test code evaluation even when backend servers or Judge0 sandboxes are offline.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/
│   │   │   ├── auth.model.ts          # User, AuthResponse, Login/Register DTOs
│   │   │   ├── problem.model.ts       # Problem, TestCases, Difficulties, Filter
│   │   │   ├── submission.model.ts    # RunCodeDto, SubmitCodeDto, Verdicts
│   │   │   └── progress.model.ts      # UserStats, TopicProgress, LearningPaths
│   │   └── services/
│   │       ├── api.service.ts         # Base HTTP client with JWT intercept
│   │       ├── auth.service.ts        # Session, JWT, Profile & Demo login
│   │       ├── problem.service.ts     # Problems CRUD, query filtering & search
│   │       ├── submission.service.ts  # Judge0 /submissions runner & evaluator
│   │       ├── progress.service.ts    # Velocity, streak & category tracking
│   │       ├── theme.service.ts       # Light/Dark mode switcher with signal
│   │       └── mock-data.service.ts   # 10 core algorithmic problems & testcases
│   ├── shared/
│   │   └── components/
│   │       ├── icon/                  # Lucide SVG icon component
│   │       ├── badge/                 # Difficulty & solve status badges
│   │       └── search-modal/          # Global Cmd+K / Ctrl+K search dialog
│   ├── layouts/
│   │   ├── header/                    # DevArena brand, nav, search, theme & user menu
│   │   ├── sidebar/                   # NestJS docs-inspired categorical navigation
│   │   └── main-layout/               # Shell wrapping content
│   ├── pages/
│   │   ├── home/                      # Editorial overview & daily benchmark
│   │   ├── problems/                  # Problem archive, search, filters & NeetCode grouping
│   │   ├── workspace/                 # Split-pane IDE workspace with testcases & runner
│   │   ├── learn/                     # Structured learning paths & topic curricula
│   │   ├── progress/                  # Personal metrics, mastery matrix & activity log
│   │   └── auth/                      # Minimal editorial Login & Registration forms
│   ├── app.config.ts
│   ├── app.routes.ts
│   └── app.component.ts
├── environments/
│   └── environment.ts                 # NestJS API endpoint configuration
├── styles.css                         # CSS variables design token system
└── index.html                         # Typography (Inter & JetBrains Mono)
```

---

## ⚡ Key Features

1. **Problem Archive (`/problems`)**:
   - Filter by Difficulty (`All`, `Easy`, `Medium`, `Hard`), Topic (`Arrays & Hashing`, `Two Pointers`, `Dynamic Programming`, etc.), and Solve Status.
   - Dual view switcher: **Compact Table View** (high density, scanable) vs **Category Grouped View** (NeetCode 150 style with topic progress bars).
   - Real-time search (`title`, `slug`, `tag`).
   - Quick progress card summarizing solved fractions.

2. **Problem Solving Workspace (`/problems/:slug`)**:
   - Dedicated distraction-free IDE shell without general sidebars.
   - **Left Panel**: Description with formatted statement, examples, and constraints; Editorial tab with $O(N)$ asymptotic analysis and copyable solution; Submissions history tab.
   - **Right Panel**: Monospaced code editor with line numbers, 5 supported languages (TypeScript, JavaScript, Python, C++, Java), and smart indentation.
   - **Bottom Console**: Collapsible tabs for sample testcases (`Case 1`, `Case 2`, etc.), custom testcase runner, execution output (stdout/stderr, runtime in ms, memory in MB), and submission results with verdict banners.
   - Keyboard shortcuts: `Ctrl + '` or `Cmd + '` to Run Code; `Ctrl + Enter` or `Cmd + Enter` to Submit.

3. **Global Search Modal (`Ctrl + K` / `Cmd + K`)**:
   - Instantly search all problems, algorithms, and categories with keyboard arrow navigation.

4. **Theme Switcher**:
   - Smooth transition between Warm Light and Balanced Neutral Dark modes.
   - Persisted across reloads in `localStorage`.

5. **Authentication (`/login` & `/register`)**:
   - Clean, minimal reactive forms with password visibility toggles.
   - 1-Click Guest Demo Login for instant testing without server setup.

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ (tested on Node v24.12)
- npm v10+

### Installation
```bash
# Clone or navigate to the directory
cd c:/NESTJS-WORKSPACE/devArena-FE

# Install dependencies
npm install
```

### Development Server
```bash
# Run local dev server (default on http://localhost:4200)
npm start
```

### Production Build
```bash
# Build optimized production bundle
npm run build
```
Build output is generated in `dist/devarena-fe`.
