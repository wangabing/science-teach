## ADDED Requirements

### Requirement: One first goal with honest observation provenance
The buoyancy, pendulum, section, moon and lens labs SHALL foreground one first goal and keep free exploration accessible. A task SHALL distinguish user manipulation from preparation, presets, demonstrations and restoration; automatic state changes SHALL NOT count as independent observation. Completion language SHALL describe observed evidence rather than certify understanding.

#### Scenario: Demonstration does not complete independent work
- **WHEN** a visitor runs a demonstration or applies a preset during an independent task
- **THEN** it remains labeled as an example, does not grant independent completion, and provides a way to prepare independent work again.

### Requirement: Buoyancy task matches the controllable apparatus
The buoyancy lab SHALL connect immersion to displaced volume, identify its 0–10 cm controllable immersion range, and state next to the apparatus that further lowering after full immersion cannot currently be operated. It SHALL distinguish that limitation from a model inference, retain units and g=10 m/s², and avoid mislabeling tank-bottom pressure as pressure on the block.

#### Scenario: Read full immersion boundary
- **WHEN** a visitor reaches 10 cm immersion in water of density 1000 kg/m³
- **THEN** the model shows 1000 cm³ displaced and 10 N buoyancy, the control boundary is explicit, and the task does not claim an independent deeper-submersion observation.

### Requirement: Pendulum period has visible endpoints and comparable records
The pendulum lab SHALL expose the two interpolated positive-to-negative zero-crossing simulation times used for its current measured period, including direction and measurement phase. It SHALL allow explicit retention of the latest two valid measurements with length, mass, gravity, release angle, damping, endpoint times and period, and identify all fixed and changed parameters. Changing conditions or restarting SHALL invalidate the current measurement without altering retained records. The records SHALL be labeled as current-page records.

#### Scenario: Measure one full cycle
- **WHEN** the pendulum passes zero in one direction and later passes zero again in the same direction
- **THEN** the visible endpoints yield T=t₂−t₁, the intermediate opposite crossing does not end measurement, and slowing playback does not change this definition.

#### Scenario: Compare and invalidate honestly
- **WHEN** a visitor retains a measurement, changes both mass and length, measures and retains a second one
- **THEN** both changes are identified and the comparison does not attribute the result to one variable; the previous live endpoints cleared on editing while the retained first record preserved its original conditions.

### Requirement: Section vertices have inspectable original-edge sources
The section lab SHALL associate each unique intersection vertex with its source cube edge or edges and link selection across the projected cube, flat section and a keyboard-operable numbered list. Selection SHALL be readable without color alone and usable by touch. Plane changes SHALL invalidate stale selection. Coincident intersections SHALL be merged without losing source associations; coplanar edges and point/line degeneracies SHALL be explicitly distinguished from polygon sections.

#### Scenario: Explain a five-sided section
- **WHEN** a visitor obtains a five-sided section and selects any numbered vertex or intersected original edge
- **THEN** both views highlight the associated vertex or vertices and original edge or edges, with a readable description of the association.

#### Scenario: Pass through a cube vertex
- **WHEN** the plane passes through a cube vertex shared by several edges
- **THEN** the geometric intersection is not duplicated, all applicable edge associations are retained, and the displayed polygon count follows the unique model intersections.

### Requirement: Moon nodes support an independent full-moon comparison
The moon lab SHALL locate and label both orbital nodes in its two-dimensional and three-dimensional representations and explain their intersection with the ecliptic plane. It SHALL offer a task prepared at phase180°, node90°, inclination5.145°, distance60.27 R⊕, requiring manual node adjustment while the other conditions stay fixed. Success SHALL use the model's total-lunar-eclipse criterion after manual adjustment, and changing a fixed condition SHALL explain the violated condition and require task preparation again. The teaching time display SHALL state that it is not a date forecast.

#### Scenario: Keep the full moon and find the shadow
- **WHEN** the visitor prepares the no-eclipse full moon and manually changes only node orientation until the model gives total lunar eclipse
- **THEN** independent observation becomes ready, the moon remains full, and the evidence distinguishes illuminated fraction from umbral coverage.

#### Scenario: Apply an eclipse example during the task
- **WHEN** the visitor uses a total-eclipse preset or the node demonstration during the independent task
- **THEN** independent task completion is not granted and the visitor is prompted to prepare another independent attempt.

### Requirement: Lens success connects directly to existing evidence
After successful manual first focusing, the lens lab SHALL offer a nearby explicit save action and a route to change object distance and refocus. This action SHALL reuse existing six-record persistence, limits and failure handling without automatically saving or solving the next focus. Virtual-image feedback SHALL provide a nearby route to the existing eye-observation window and state that a screen cannot collect a sharp virtual image.

#### Scenario: Save from the success location
- **WHEN** the visitor manually focuses and chooses the nearby save action
- **THEN** exactly one current observation is added through the existing notebook, or a full-capacity/storage limitation is accurately reported, and the visitor can continue toward a second independently focused observation.

### Requirement: First-task evidence remains accessible
The new tasks SHALL work with keyboard and at 320px widths without page-level horizontal overflow, SHALL preserve reduced-motion and pause/manual-takeover behavior, and SHALL avoid announcing changing numerical evidence every frame through live regions.

#### Scenario: Inspect evidence without precise dragging
- **WHEN** a visitor uses keyboard or touch in a narrow viewport
- **THEN** they can reach the task action, inspect its selected evidence and return to free exploration without relying solely on color, motion or tiny SVG hit targets.
