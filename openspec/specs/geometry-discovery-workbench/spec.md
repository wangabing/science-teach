# geometry-discovery-workbench Specification

## Purpose
TBD - created by archiving change add-geometry-discovery-studios. Update Purpose after archive.
## Requirements
### Requirement: Accessible constrained exploration
Each studio SHALL distinguish fixed conditions, free inputs and dependent constructions, expose direct SVG pointer and keyboard interaction with equivalent native controls, and provide undo/redo/reset, readable 390px layout, visible focus and no-script explanation.

#### Scenario: Keyboard and touch
- **WHEN** a student adjusts a geometric point by keyboard or touch
- **THEN** dependent objects recompute, constraints remain true and the page does not overflow

### Requirement: Reproducible evidence and honest tasks
The studios SHALL retain two current-page snapshots, export unit-bearing versioned CSV, restore inputs and recompute results without restoring task credit or invented trace history. Examples, answer reveal, restoration and undo MUST clear independent task credit.

#### Scenario: Restore a saved observation
- **WHEN** a saved state is restored after edits
- **THEN** original observations recompute, independent completion clears and unsaved traces are not reconstructed

### Requirement: Chinese geometry learning route
The product SHALL include four catalog entries, topic-level middle/high-school routes, original history context, known conditions, auxiliary constructions, general reasoning and counterexamples without asserting unverified Beijing textbook or examination alignment.

#### Scenario: Evidence to proof
- **WHEN** a student finishes an observation
- **THEN** a separate general argument and a changed-condition question remain available

