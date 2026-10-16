# interactive-exploration Specification

## Purpose
TBD - created by archiving change add-six-exploration-labs. Update Purpose after archive.
## Requirements
### Requirement: Four spaces expose eight real experiments
The site SHALL expose two working independent experiments in each of the four spaces and derive counts from catalog data.

#### Scenario: Explore catalog
- **WHEN** a visitor opens the homepage, any space, or the full catalog
- **THEN** they see eight total experiments, two in each space, with correct links and topic-specific previews.

### Requirement: Area rearrangement preserves geometry
The area lab SHALL allow moving and rotating four congruent right triangles between two arrangements, adjusting leg lengths, resetting, and obtaining evidence for a²+b²=c².

#### Scenario: Complete rearrangement
- **WHEN** the visitor correctly places four triangles in the target arrangement
- **THEN** completion feedback explains equal outer area and triangle area, leaving equal c² and a²+b².

### Requirement: Cube sections use actual intersections
The section lab SHALL compute intersections of a plane with cube edges and expose orientation, offset, and triangle/square/hexagon presets.

#### Scenario: Hexagon section
- **WHEN** a visitor selects the hexagon preset
- **THEN** a six-vertex section appears with its corresponding three-dimensional projected position and two-dimensional shape.

### Requirement: Satellite launch models orbital motion
The orbit lab SHALL expose speed/direction, circular and escape comparisons, launch/pause/step/reset, trajectory and collision/escape feedback using a Newtonian central force.

#### Scenario: Circular launch and collision
- **WHEN** a visitor launches at circular speed or selects a falling preset
- **THEN** the model produces a near circular orbit or stops at surface collision respectively and explains the result.

### Requirement: Three body comparison is honest
The three body lab SHALL offer figure-eight and sensitive presets, adjustable perturbation, two synchronized simulations, separation, energy error, and explicit softened model assumptions.

#### Scenario: Compare near initial states
- **WHEN** a visitor runs the paired simulations
- **THEN** the two trajectories come from their own integrated states and their measured separation and energy errors update; close encounters pause with an explanation.

### Requirement: Bridge construction supports real structural feedback
The bridge lab SHALL allow adding/removing specified members, choosing examples, changing applied load, and detecting unstable configurations using planar linear truss analysis.

#### Scenario: Compare rectangle and triangulation
- **WHEN** a visitor removes necessary diagonals and then restores them
- **THEN** the unbraced configuration is reported unstable and the braced structure shows calculated member forces, reactions, and displacement under the same load.

### Requirement: Gear workshop derives transmission
The gear lab SHALL allow two or three gears, editable tooth counts, input speed, rotation controls, and a target ratio challenge with calculated speed, direction, and ideal torque ratio.

#### Scenario: Intermediate gear
- **WHEN** a visitor adds an intermediate external gear and changes its tooth count
- **THEN** output direction reverses relative to a two-gear pair while the overall magnitude ratio remains determined by input/output tooth counts.

### Requirement: Experiments are usable and documented
All new experiments MUST support 320px mobile layouts, keyboard alternatives, touch input where relevant, explicit animation start, pause/reset, reduced motion, readable no-script explanations, and documentation in doc/.

#### Scenario: Accessible exploration
- **WHEN** a visitor uses the keyboard, a mobile screen, reduced motion, or disabled JavaScript
- **THEN** controls are reachable and labeled, pages do not overflow, animation is not started automatically, and scientific explanations and static diagrams remain readable.

