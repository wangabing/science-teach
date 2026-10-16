## ADDED Requirements

### Requirement: Explicit standard demonstrations
All six labs SHALL offer labeled standard demonstrations with visible stage explanations and pause/reset/manual takeover, without autoplay on page load.

#### Scenario: Pause and take over
- **WHEN** a visitor starts a demonstration, pauses it, or changes a parameter manually
- **THEN** the demonstration progresses with explanatory feedback, freezes when paused, and stops scheduling changes after manual takeover or page hide.

### Requirement: Mathematics starts with accessible actions
The area lab SHALL support automatic orientation in a one-piece next action and animated rearrangement; the section lab SHALL demonstrate square, hexagon and triangle sections and display model-derived area/perimeter and plane substitution.

#### Scenario: Learn without precision dragging
- **WHEN** a visitor chooses next piece or the standard area demo
- **THEN** congruent triangles move to valid targets without requiring guessing rotation, while progress and area evidence remain consistent.

### Requirement: Space labs connect motion and evidence
The orbit lab SHALL show live kinetic/potential/total energy, orbital parameters, velocity/gravity vectors and radius history, with circular/elliptical demonstrations. The three-body lab SHALL expose mass and initial velocity scaling, force directions, energy and separation history plus faster observation controls.

#### Scenario: Compare conditions
- **WHEN** the visitor changes an orbital preset or mass/velocity in the three-body model and runs it
- **THEN** trajectories and quantitative evidence come from the same current state, old history clears, and scientific model limitations and numerical error remain visible.

### Requirement: Bridge teaches building and inspecting
The bridge lab SHALL provide a guided bare-frame to diagonal-bracing to loading sequence, explicit task instructions, member inspection separate from deletion, live forces and support reaction comparison.

#### Scenario: Inspect before removing
- **WHEN** the visitor clicks a stable bridge member
- **THEN** the member remains, its signed force and tension/compression explanation appear, and only an explicit removal action deletes it.

### Requirement: Gear relationships are visible
The gear lab SHALL present an adjacent workshop/evidence layout on desktop and readable stacked layout on mobile, standard reduction/reversal demonstrations, cumulative turn comparison, substituted ratio and torque formulas and live comparison bars.

#### Scenario: Observe reduction
- **WHEN** the visitor runs the 20-to-60 tooth reduction example
- **THEN** output turns accumulate at one third the input rate and ideal torque magnitude is three times input, with current values displayed next to the formulas.

### Requirement: Evidence is accessible and verified
Live charts SHALL include labels, units or dimensionless descriptions, accompanying readable values, bounded history and no repeated live-region announcements per frame. All added controls SHALL work with keyboard and 320px layouts.

#### Scenario: Read chart without relying on color
- **WHEN** a visitor explores with keyboard, reduced motion or a small viewport
- **THEN** they can run/stop demos and read numerical evidence and chart descriptions without horizontal overflow or color-only meaning.
