# Game Settings Menu Design Specification

## Overview
This document outlines the design for adding settings menus to both Jeopardy and Last Man Standing (LMS) games. It allows users to configure game parameters through a gear icon on the admin pages, with state persisted via the existing Zustand stores.

## Goals
1. Configurable Jeopardy penalties and timing.
2. Configurable LMS points distribution and visual timers.
3. Persistent storage via existing Zustand `persist` middleware.
4. Seamless integration with existing Admin and Game views.

## Architecture

### 1. State Management
Settings will be integrated directly into the existing game stores to leverage established persistence patterns.

#### Jeopardy Store (`src/games/jeopardy/store.ts`)
- **Settings State**:
  ```typescript
  settings: {
    wrongAnswerPenalty: number; // 0.0 to 1.0 (default 1.0)
    answerTimeLimit: number;    // seconds, 0 = disabled (default 0)
  }
  ```
- **Action**: `updateSettings(settings: Partial<JeopardySettings>)`

#### LMS Store (`src/games/lms/store.ts`)
- **Settings State**:
  ```typescript
  settings: {
    survivorPointsType: 'standard' | 'half' | 'double' | 'fixed';
    fixedPointsValue: number; // Used when type is 'fixed'
    answerCardTimerEnabled: boolean; // (default false)
  }
  ```
- **Action**: `updateSettings(settings: Partial<LmsSettings>)`

### 2. Data Flow
- Settings are modified in the Admin pages via a Modal.
- `startGame` snapshotting: When a game starts, the current settings are part of the store state.
- Gameplay logic (e.g., `award`, `distributeRoundPoints`) reads from the store's `settings`.

## UI Implementation

### Access
- **Button**: A gear/cog icon (`IconButton` or `Button` with icon) added to the header area of `JeopardyAdminPage` and `LmsAdminPage`.
- **Modal**: Uses the existing `Modal` component.

### Jeopardy Settings Modal
1. **Wrong Answer Penalty**: 
   - Label: "Wrong Answer Penalty"
   - UI: Slider (0.0 to 1.0, step 0.1) or Number Input.
   - Description: "Percentage of point value lost on incorrect answers."
2. **Answer Time Limit**:
   - Label: "Answer Time Limit"
   - UI: Number Input (min 0, step 5).
   - Description: "Seconds allowed to answer. 0 to disable."

### LMS Settings Modal
1. **Survivor Points**:
   - Label: "Survivor Points Distribution"
   - UI: Select/Dropdown (Standard, Half, Double, Fixed).
   - Conditional UI: Number Input for "Points Value" if "Fixed" is selected.
2. **Answer Card Timer**:
   - Label: "Host Answer Timer"
   - UI: Toggle/Switch.
   - Description: "Show a 2-minute visual timer when a card is clicked in host view."

## Gameplay Integration

### Jeopardy
- **Penalty**: `award(playerId, delta)` in `store.ts` will multiply negative `delta` by `settings.wrongAnswerPenalty`.
- **Timer**: `QuestionView.tsx` will display a countdown if `settings.answerTimeLimit > 0`.

### LMS
- **Points**: `distributeRoundPoints` in `store.ts` will apply the formula based on `settings.survivorPointsType`.
- **Timer**: `AnswerCard.tsx` (Host view) will start a 120s timer visual when enabled and clicked.

## Validation & Testing
- **Persistence**: Ensure settings survive page refresh.
- **Mid-game Change**: Verify that changing settings in Admin during an active game does *not* affect the current game until restarted.
- **Constraints**: Clamp penalty between 0-1 and timer to non-negative.
