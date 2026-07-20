## ADDED Requirements

### Requirement: Physical key mapping

The system SHALL map ArrowLeft/ArrowRight/ArrowDown/ArrowUp, Space, KeyP, KeyR, and KeyS to left, right, down, rotate, hard-drop/start, pause/start, reset/start, and music toggle respectively, ignoring meta-modified keys.

#### Scenario: Key hold does not use native repeat

- **WHEN** the browser fires repeated keydown for the same key without keyup
- **THEN** the system MUST NOT invoke the action down handler again until keyup clears the active key

### Requirement: Custom repeat cadence

The system SHALL implement press-and-hold repeat via configurable `begin` and `interval` delays, and MUST clear other keys' repeat timers when a new key starts. One-shot actions MUST use `once` mode.

#### Scenario: Soft drop cadence

- **WHEN** down is held during play
- **THEN** soft-drop callbacks MUST fire with begin 40ms and interval 40ms

#### Scenario: Horizontal move cadence

- **WHEN** left or right is held during play
- **THEN** move callbacks MUST fire with begin 200ms and interval 100ms

### Requirement: Playing controls

During play with an unlocked session, left/right MUST move with legacy delay-to-fall compensation (wall contact uses delay/1.5), down MUST soft-drop or lock, rotate MUST attempt one rotation, space MUST hard-drop to the lowest valid row, P MUST toggle pause, R MUST trigger `overStart`, and S MUST toggle music. While paused, movement/rotate/drop MUST unpause first as in the legacy game. While `lock` is true, gameplay inputs MUST be ignored.

#### Scenario: Hard drop

- **WHEN** space is pressed during play
- **THEN** the piece MUST move to the lowest valid position, lock, briefly set `drop` true for about 100ms, and proceed to next-around

### Requirement: Idle tuning controls

When `cur` is null and unlocked, left/right MUST cycle `speedStart` in 1–6, down/rotate MUST cycle `startLines` in 0–10, and Space/P/R MUST start a new game.

#### Scenario: Increase start lines

- **WHEN** rotate is held or pressed in Idle
- **THEN** `startLines` MUST increase and wrap from 10 to 0

### Requirement: On-screen controls

The system SHALL provide on-screen buttons that invoke the same down/up handlers as the physical keyboard, supporting touch and mouse without double-firing, and MUST reflect pressed state via `keyboard` flags.

#### Scenario: Touch prevents mouse duplicate

- **WHEN** a control is activated via touchstart
- **THEN** a subsequent mouse event for the same control MUST NOT trigger a second down action
