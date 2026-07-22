# React Tetris (TypeScript + Tauri 2)

A handheld-style Tetris project built with **React 19 + TypeScript + Jotai + Vite + Sass + Tauri 2**.  
The same frontend codebase runs on:

- Web browsers
- Tauri desktop apps
- Tauri Android apps

It supports keyboard and touch controls, local persistence, multiple languages, and audio effects.

## Features

- 7 classic tetrominoes: `I / J / L / O / S / T / Z`
- Shared gameplay logic across Web, Desktop, and Android
- Keyboard controls on desktop and virtual controls on mobile
- Automatic `localStorage` persistence for game progress and high score
- Web Audio based sound effects
- Multi-language support via `?lan=cn|en|fr|fa`

## Tech Stack

- React 19
- TypeScript
- Jotai
- Vite 7
- Sass
- UnoCSS
- Vitest
- Playwright
- Tauri 2

## Quick Start

### Requirements

- Node.js `24.x`
- pnpm `11.x`

Install dependencies:

```bash
pnpm install
```

Start the web dev server:

```bash
pnpm dev
```

The app is usually available at `http://127.0.0.1:5173`.

## Common Commands

### Web

```bash
pnpm dev
pnpm build
pnpm preview
```

### Desktop

```bash
pnpm tauri:dev
pnpm tauri:build
```

### Android

```bash
pnpm tauri:android:init
pnpm tauri:android:dev
pnpm tauri:android:build:apk
pnpm tauri:android:build:aab
```

### Tests and Quality Checks

```bash
pnpm test
pnpm test:watch
pnpm e2e
pnpm e2e:headed
pnpm lint
pnpm lint:fix
pnpm fmt
pnpm fmt:check
```

## Controls

| Key              | In Game           | Before Start                |
| ---------------- | ----------------- | --------------------------- |
| `Left` / `Right` | Move horizontally | Change starting speed `1-6` |
| `Up`             | Rotate            | Increase starting lines     |
| `Down`           | Soft drop         | Decrease starting lines     |
| `Space`          | Hard drop         | Start game                  |
| `P`              | Pause / Resume    | Start game                  |
| `R`              | Restart           | Start game                  |
| `S`              | Toggle sound      | Toggle sound                |

Mobile users can perform the same actions through the on-screen control pad.

## Project Structure

```text
react-tetris-ts/
├── public/                 # Static assets: icon, loader.css, music.mp3
├── src/
│   ├── main.tsx            # React entry, binds persistence / keyboard / visibility / E2E hooks
│   ├── App.tsx             # Root layout, responsive scaling, restore/start logic
│   ├── domain/             # Pure gameplay rules: blocks, collisions, matrix, score
│   ├── game/               # Match flow controller and auto-drop scheduling
│   ├── state/              # Jotai atoms, store, localStorage persistence
│   ├── input/              # Keyboard, touch, repeat events, focus handling
│   ├── components/         # UI components
│   ├── audio/              # Web Audio sound system
│   ├── i18n/               # Language resources
│   ├── styles/             # Sass styles
│   └── test-hooks/         # E2E helper hooks
├── e2e/                    # Playwright specs
├── src-tauri/              # Tauri 2 shell
│   ├── tauri.conf.json     # Desktop config
│   ├── tauri.android.conf.json
│   ├── capabilities/
│   └── gen/android/        # Generated Android project
├── QA.md                   # Manual release checklist
└── TAURI-ANDROID.md        # Android environment and packaging guide
```

## Core Gameplay Architecture

### 1. Rules Layer: `src/domain/`

This layer is implemented as pure functions and does not depend on React.

- `block.ts`
  - create tetrominoes
  - rotate pieces
  - move left / right / down
- `matrix.ts`
  - collision checks with `want()`
  - line clear detection with `isClear()`
  - game over detection with `isOver()`
  - lock pieces into the board with `lockPiece()`
- `score.ts`
  - placement score
  - line clear score
  - speed level progression
- `const.ts`
  - board size: `10 x 20`
  - speed table: `[800, 650, 500, 370, 250, 160]`
  - clear scores: `[100, 300, 700, 1500]`

### 2. Flow Layer: `src/game/controller.ts`

`controller` manages the full lifecycle of a game:

- game start and restore
- auto-drop timer scheduling
- lock and spawn transitions
- post-clear continuation
- pause / resume
- game over / restart

The flow is roughly:

1. Build the current piece from `nextAtom`
2. Schedule auto-drop according to the current speed
3. Validate each movement with `want()`
4. Lock the piece into the board with `lockPiece()` when it can no longer fall
5. Detect full lines with `isClear()`
6. Update score and speed using `clearLinePoints()` and `nextSpeedRun()`
7. End the game when `isOver()` detects top overflow

### 3. State Layer: `src/state/`

Global state is managed with Jotai:

- `atoms.ts` defines the game atoms
- `store.ts` creates `gameStore`
- `persist.ts` reads/writes `localStorage`

Persistence key: `REACT_TETRIS`

### 4. Input Layer: `src/input/`

- `keyboard.ts`: physical keyboard binding
- `actions.ts`: gameplay actions per key
- `event.ts`: key repeat / long-press scheduling
- `visibility.ts`: pause/resume on blur and visibility changes

This allows desktop keyboard input and mobile touch input to share the same behavior layer.

## Startup Flow

### Web

Startup path:

`index.html` -> `src/main.tsx` -> `src/App.tsx`

Before mounting React, `src/main.tsx` sets up:

- style loading
- i18n initialization
- audio initialization
- persistence subscription
- keyboard binding
- visibility binding
- E2E hooks

### Desktop

Tauri Rust entry files:

- `src-tauri/src/main.rs`
- `src-tauri/src/lib.rs`

Desktop dev command:

```bash
pnpm tauri:dev
```

Flow:

1. Tauri runs `beforeDevCommand`
2. It starts `pnpm exec vite --host 127.0.0.1 --port 1420`
3. The desktop window loads `http://127.0.0.1:1420`

Desktop build command:

```bash
pnpm tauri:build
```

Flow:

1. Run `pnpm build`
2. Generate `dist/`
3. Package the current platform app with Rust/Tauri

Common desktop output directory:

`src-tauri/target/release/bundle/`

## Android Packaging

Android-related files:

- `src-tauri/tauri.android.conf.json`
- `src-tauri/gen/android/`

### 1. Initialize the Android project

```bash
pnpm tauri:android:init
```

This generates:

`src-tauri/gen/android/`

### 2. Run on device / emulator

```bash
pnpm tauri:android:dev
```

Required locally:

- Rust
- Android SDK / NDK
- JDK 17
- `adb`

See `TAURI-ANDROID.md` for the full environment setup.

### 3. Build APK / AAB

```bash
pnpm tauri:android:build:apk
pnpm tauri:android:build:aab
```

Common output locations:

- Unsigned APK  
  `src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release-unsigned.apk`
- Signed APK  
  Usually generated in the same directory without `unsigned` in the filename

### 4. Configure release signing

This project already supports automatic Android release signing.

Create:

`src-tauri/gen/android/keystore.properties`

Template:

`src-tauri/gen/android/keystore.properties.example`

Format:

```properties
storeFile=/absolute/path/to/release-keystore.jks
storePassword=your-store-password
keyAlias=react-tetris
keyPassword=your-key-password
```

Then rebuild:

```bash
pnpm tauri:android:build:apk
```

to produce an installable signed release APK.

## Testing

### Unit and Component Tests

Vitest is configured in `vitest.config.ts` and covers:

- `src/domain/block.test.ts`
- `src/domain/matrix.test.ts`
- `src/game/controller.test.ts`
- `src/state/persist.test.ts`
- `src/input/event.test.ts`
- `src/input/keyboard.test.ts`
- `src/input/visibility.test.ts`
- `src/App.test.tsx`
- `src/components/components.test.tsx`

Run:

```bash
pnpm test
```

### E2E

Playwright is configured in `playwright.config.ts` and starts:

`pnpm dev --host 127.0.0.1 --port 4173`

Run:

```bash
pnpm e2e
```

Headed mode:

```bash
pnpm e2e:headed
```

### Manual QA

Before a release, use `QA.md` to verify:

- startup and build
- keyboard and touch controls
- line clear / scoring / speed progression
- pause and resume
- persistence restore
- multi-language behavior
- responsive layout

## Related Docs

- Android environment and packaging: `TAURI-ANDROID.md`
- Manual release checklist: `QA.md`
