## ADDED Requirements

### Requirement: Release-blocking automated coverage

The project SHALL provide automated tests for release-critical behavior, including domain rules, persistence, game flow, input timing, browser event bindings, and page-level smoke rendering.

#### Scenario: Full suite covers critical layers

- **WHEN** the automated test suite is executed before release
- **THEN** it MUST exercise domain, state persistence, controller/input flow, and UI smoke coverage rather than only pure utility functions

### Requirement: Deterministic timing and side-effect tests

Tests for timers, event repeat loops, localStorage, and browser capability detection SHALL be deterministic through mocks or fake timers.

#### Scenario: Repeatable timer behavior

- **WHEN** the test suite verifies auto-fall or input repeat behavior
- **THEN** it MUST use deterministic timing controls so the same assertions pass reliably across runs

### Requirement: Bug-fix feedback loop

Any bug exposed by the automated test suite SHALL be fixed in application code before the change is considered complete.

#### Scenario: Test reveals product defect

- **WHEN** a newly added automated test fails due to incorrect application behavior
- **THEN** the implementation MUST be corrected and the suite rerun until the failure is resolved

### Requirement: Publish-ready validation

The test initiative SHALL conclude only after the full automated suite passes together with type checking and production build validation.

#### Scenario: Release validation

- **WHEN** the implementation work is finished
- **THEN** `pnpm test`, TypeScript checking, and production build validation MUST all succeed
