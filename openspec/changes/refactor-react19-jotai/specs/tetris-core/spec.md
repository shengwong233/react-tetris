## ADDED Requirements

### Requirement: Board and cell representation

The system SHALL represent the playfield as a 20-row by 10-column matrix of cells with logical values 0 (empty) and 1 (occupied).

#### Scenario: Blank board

- **WHEN** a new blank matrix is created
- **THEN** it MUST contain 20 rows of 10 zeros each

### Requirement: Seven tetromino types

The system SHALL support tetromino types I, L, J, Z, S, O, and T with the same initial shapes as the legacy game.

#### Scenario: Spawn positions

- **WHEN** an I piece is spawned
- **THEN** its initial position MUST be row 0, column 3
- **WHEN** any other type is spawned
- **THEN** its initial position MUST be row -1, column 4

### Requirement: Rotation with origin offsets

The system SHALL rotate the active piece clockwise by 90 degrees and apply the legacy `origin` offsets for I (2 states) and T (4 states); other types MUST use a zero offset.

#### Scenario: Invalid rotation discarded

- **WHEN** a rotated position fails collision checks
- **THEN** the piece MUST remain in its previous orientation and position

### Requirement: Collision detection

The system SHALL reject moves that exit the left, right, or bottom bounds, or overlap occupied cells; cells with row index less than 0 MUST be allowed.

#### Scenario: Top overhang allowed

- **WHEN** part of the active piece is above row 0 and does not collide horizontally or with occupied cells
- **THEN** the position MUST be considered valid

### Requirement: Lock and line clear rules

The system SHALL lock an active piece into the matrix when it can no longer fall, ignoring cells with row index less than 0. The system SHALL detect full rows and clear them by removing those rows and inserting blank rows at the top.

#### Scenario: Clear multiple lines

- **WHEN** multiple rows are full after a lock
- **THEN** all full row indices MUST be returned and those rows MUST be cleared in a single clear operation

### Requirement: Scoring and speed progression

The system SHALL award placement points as `10 + (speedRun - 1) * 2`, award clear points `[100, 300, 700, 1500]` for 1–4 lines, cap score at 999999, and increase run speed by `floor(clearLines / 20)` relative to `speedStart` up to level 6. Fall intervals MUST use `[800, 650, 500, 370, 250, 160]` ms for levels 1–6.

#### Scenario: Speed increases after 20 lines

- **WHEN** cumulative cleared lines reach 20 and `speedStart` is 1
- **THEN** `speedRun` MUST become 2

### Requirement: Start-line garbage generation

The system SHALL generate a bottom stack of `startLines` (0–10) randomized garbage rows with density bands matching the legacy algorithm, padding the top with blank rows to height 20.

#### Scenario: Zero start lines

- **WHEN** `startLines` is 0
- **THEN** the start matrix MUST be entirely blank

### Requirement: Next piece selection

The system SHALL choose the next piece type by uniform random selection among the seven types (no 7-bag).

#### Scenario: Preview is a single type

- **WHEN** a piece is consumed from `next`
- **THEN** a new random type MUST be assigned to `next`
