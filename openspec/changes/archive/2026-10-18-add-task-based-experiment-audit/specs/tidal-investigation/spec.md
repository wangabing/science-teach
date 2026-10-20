## ADDED Requirements

### Requirement: Discoverable distance demonstration
The tidal experiment SHALL present a named start action beside the apparatus and support distance scanning, pause, single step and reset without claiming elapsed physical time or earning independent task credit.

#### Scenario: Follow the approach demonstration
- **WHEN** a student starts the demonstration
- **THEN** distance, body position, force evidence, curve cursor and measurements change together; pausing retains the state and reduced motion offers single steps

### Requirement: Manipulate the same body in both views
Students SHALL directly drag the small body in both two-dimensional and three-dimensional views to change distance. Background camera rotation MUST NOT change physical inputs. Equivalent labelled controls SHALL remain accessible.

#### Scenario: Drag in space and return to the plane
- **WHEN** a student drags the small body in three dimensions then switches views
- **THEN** the same distance and measurements persist and undo restores the previous condition

### Requirement: Honest tidal evidence
The experiment SHALL distinguish local tidal acceleration, self gravity and the fluid Roche limit; explain approximations and graphical scale; and MUST NOT imply a solved fragmentation trajectory.

#### Scenario: Compare two distances
- **WHEN** distance halves with mass, density and radius fixed
- **THEN** tidal acceleration increases eightfold, self gravity remains constant, and the apparatus changes consistently with the selected distance

#### Scenario: Drag where the body crosses the Roche marker
- **WHEN** the small body overlaps the Roche marker line
- **THEN** the annotation does not intercept pointer events and dragging the visible body still changes distance
