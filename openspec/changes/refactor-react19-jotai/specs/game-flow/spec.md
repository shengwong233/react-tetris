## ADDED Requirements

### Requirement: Game session phases

The system SHALL support Idle (no active piece), Playing, Paused, Locked (input/fall blocked), Clearing (line-clear animation pending), and Game Over (reset animation) phases, driven by `cur`, `pause`, `lock`, `reset`, and clear detection.

#### Scenario: Start from idle

- **WHEN** the player starts a game from Idle
- **THEN** points MUST reset to 0, `speedRun` MUST equal `speedStart`, a start matrix MUST be applied, an active piece MUST be created from `next`, `next` MUST be refreshed, and auto-fall MUST begin

### Requirement: Auto-fall timer

The system SHALL auto-fall the active piece on a timeout based on `speedRun`, and MUST clear and reschedule the timer when horizontal move delay logic requests a remaining timeout.

#### Scenario: Cannot fall

- **WHEN** auto-fall finds the next fall position invalid
- **THEN** the piece MUST be locked into the matrix and `nextAround` processing MUST run

### Requirement: Next-around after lock

After locking, the system SHALL add placement points, set `lock` true, and then either wait for line-clear animation, start game-over if the top row is occupied, or after 100ms unlock and spawn the next piece.

#### Scenario: Top row occupied

- **WHEN** after lock the matrix row 0 contains any occupied cell
- **THEN** the system MUST enter game-over flow (`overStart`)

### Requirement: Pause and focus

The system SHALL stop the fall timer while paused or when the page is unfocused, and MUST resume auto-fall when unpaused or refocused if an active piece exists and the game is not resetting.

#### Scenario: Tab hidden

- **WHEN** document visibility becomes hidden during play
- **THEN** auto-fall MUST stop until focus returns

### Requirement: Game over and reset animation hooks

The system SHALL set `reset` and `lock` on `overStart`, and on `overEnd` MUST clear the matrix, clear the active piece, clear `reset`/`lock`, and reset `clearLines` to 0.

#### Scenario: Over end returns to idle

- **WHEN** the game-over animation completes
- **THEN** the session MUST be Idle with a blank matrix and `cur` null
