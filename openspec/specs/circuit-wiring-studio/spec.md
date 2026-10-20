# circuit-wiring-studio Specification

## Purpose
TBD - created by archiving change add-circuit-wiring-studio. Update Purpose after archive.
## Requirements
### Requirement: Free terminal wiring
The studio SHALL allow arbitrary connections between six labeled terminals using pointer or keyboard, reject duplicate/self wires, and support canceling selection, removing individual wires and clearing the board.

#### Scenario: First closed loop
- **WHEN** a student connects B1 to N on the initial board with P–A1 already connected
- **THEN** lamp1 lights with positive measured power and lamp2 remains unpowered

### Requirement: Consistent resistive physics
The studio MUST solve ideal-wire topology and constant-resistance lamps with E=3–9 V, r=1 Ω and lamp resistances 10–40 Ω, report current, voltage and power, distinguish floating/open/bypassed/shorted states, and conserve source power including internal loss.

#### Scenario: Reference loads
- **WHEN** E=6 V and both lamps are 20 Ω
- **THEN** a single lamp draws 6/21 A, series lamps draw 6/41 A and parallel lamps each draw 3/11 A

#### Scenario: Short circuit
- **WHEN** P and N are connected by ideal wire
- **THEN** source current is 6 A at E=6 V, external voltage and lamp powers are zero, and feedback identifies a source short rather than reporting an infinite current

### Requirement: Independent branch verification
The studio SHALL offer a challenge starting from empty wiring, distinguish examples/restored records from independent work, and verify that both lights initially work and each remains powered when the other lamp is removed. It MUST explain source internal-resistance coupling.

#### Scenario: Student tests parallel branches
- **WHEN** the student builds two independent branches and personally disconnects lamp1
- **THEN** lamp2 remains powered, the challenge reports observed success and shows the before/after evidence

#### Scenario: Examples and edits invalidate proof
- **WHEN** a preset, restore, parameter change or wiring edit changes a completed challenge
- **THEN** the old completion is cleared and is never attributed to the current configuration

### Requirement: Reproducible observations
The studio SHALL retain at most two current-page input snapshots, restore by recomputing results without restoring challenge success, export CSV with units/model constants, and identify multiple changed conditions without claiming a single-variable comparison.

#### Scenario: Compare and restore
- **WHEN** a student saves a wired configuration, changes resistance, saves again and restores the first
- **THEN** the first input and recomputed measurements return, both saved records remain and the comparison identifies the changed resistance

### Requirement: Discoverable accessible experiment
The new experiment SHALL appear in physics and all-experiment directories with a distinctive preview, historical context, model limitations, optional example reading and no-script explanations. The workbench MUST fit 390 px width and permit keyboard/touch wiring without a drag gesture.

#### Scenario: Mobile entry
- **WHEN** a student enters from the physics directory on a phone
- **THEN** they can connect terminals, read lamp evidence and open history without page-level horizontal overflow

