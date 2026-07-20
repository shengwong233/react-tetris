## ADDED Requirements

### Requirement: Persist game state to localStorage

The system SHALL persist the serializable game state to localStorage under the key `REACT_TETRIS`, encoding with `encodeURIComponent` and `btoa` when available, matching the legacy payload shape sufficiently to restore play.

#### Scenario: Skip write while locked

- **WHEN** `lock` is true
- **THEN** the system MUST NOT write a new persistence snapshot

### Requirement: Restore on load

On application load, the system SHALL read and decode the stored record when present and valid, and MUST initialize matrix, scores, speeds, flags, next type, and active piece (reconstructed) from that record.

#### Scenario: Corrupt storage

- **WHEN** stored data cannot be decoded or parsed
- **THEN** the system MUST treat it as no record and start from defaults

### Requirement: Resume in-progress games

When a restored record has an active piece and is not paused, the system MUST resume auto-fall. When there is no active piece after restore handling, the system MUST enter the idle/game-over animation path consistent with legacy boot behavior.

#### Scenario: Resume playing game

- **WHEN** the page reloads mid-game with `cur` present and `pause` false
- **THEN** auto-fall MUST continue without requiring the player to press start
