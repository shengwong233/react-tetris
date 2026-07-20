## ADDED Requirements

### Requirement: Language selection via query parameter

The system SHALL select UI language from the `lan` query parameter among `cn`, `en`, `fr`, and `fa`, defaulting to `cn` when missing or invalid, and MUST set `document.title` from the localized title.

#### Scenario: Valid language

- **WHEN** the page is opened with `?lan=en`
- **THEN** English strings MUST be used for UI labels and the document title

#### Scenario: Invalid language

- **WHEN** the page is opened with `?lan=xx`
- **THEN** the default language `cn` MUST be used

### Requirement: Localized UI copy

The system SHALL localize player-facing labels including score, max, last round, cleans, level, start line, next, pause, sound, reset, and directional control labels consistently with the legacy `i18n.json` content.

#### Scenario: Control labels

- **WHEN** the on-screen keyboard is rendered
- **THEN** button labels MUST use the active language strings
