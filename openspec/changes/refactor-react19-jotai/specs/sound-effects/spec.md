## ADDED Requirements

### Requirement: Web Audio slice playback

When Web Audio API is available and the page is served over http(s), the system SHALL load a single `music.mp3` buffer and play legacy time slices for start, clear, fall, gameover, rotate, and move.

#### Scenario: Music disabled

- **WHEN** the music flag is false
- **THEN** sound slice playback MUST not be audible

### Requirement: Start sound once per session load

The start sound handler MUST disable itself after the first successful start play so subsequent starts in the same page session do not replay the start jingle (legacy `killStart` behavior).

#### Scenario: Second start silent for start jingle

- **WHEN** the player starts a game a second time in the same page load after start sound already played
- **THEN** the start slice MUST not play again

### Requirement: Graceful degradation

When Web Audio is unavailable or the protocol is unsupported, the system MUST disable music capability and keep the music flag false.

#### Scenario: No AudioContext

- **WHEN** AudioContext is missing
- **THEN** the music toggle MUST remain off and game play MUST continue without errors
