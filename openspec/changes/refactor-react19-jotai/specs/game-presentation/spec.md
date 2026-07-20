## ADDED Requirements

### Requirement: Handheld composition layout

The system SHALL render a handheld-style composition including decorate chrome, playfield matrix, side panel (score/lines/level/next/music/pause/clock), on-screen keyboard, and desktop guide elements.

#### Scenario: Playing side panel metrics

- **WHEN** an active piece exists
- **THEN** the side panel MUST show current points labeling rules, cleared lines, run speed, and next preview

#### Scenario: Idle side panel metrics

- **WHEN** there is no active piece
- **THEN** the side panel MUST show start-line and start-speed tuning values instead of in-game lines/speed

### Requirement: Matrix rendering and animations

The system SHALL composite the locked matrix with the active piece for display. On line clear it MUST flash full rows between empty and highlight states for three blink cycles before invoking clear completion. On game over it MUST run the fill-then-clear row animation then invoke over-end.

#### Scenario: Line clear flash then clear

- **WHEN** full lines are detected after a lock
- **THEN** the matrix UI MUST animate those rows before the game engine removes them

### Requirement: Logo idle animation

The system SHALL show the logo animation only while idle and not in the reset animation, and MUST hide it during active play.

#### Scenario: Logo hidden in play

- **WHEN** `cur` is present
- **THEN** the logo overlay MUST not be visible

### Requirement: Responsive scaling

The system SHALL scale the 640×960 design using CSS transform based on viewport width/height, applying vertical filling space to keyboard spacing when scaling by width.

#### Scenario: Tall viewport

- **WHEN** viewport height/width is at least 1.5
- **THEN** scale MUST be based on width / 640 and filling padding MUST be applied

### Requirement: Hard-drop visual feedback

The system SHALL briefly apply a drop/shake visual class when `drop` is true after a hard drop.

#### Scenario: Drop pulse

- **WHEN** a hard drop locks a piece
- **THEN** the main screen container MUST show the drop visual for about 100ms
