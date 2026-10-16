# center-of-mass-stability Specification

## Purpose
Provide a manipulable center-of-mass and stability experiment with shared quantitative evidence, gravity-driven release, accessible planar fallback and guided exploration.
## Requirements
### Requirement: Weighted center and support criterion
The experiment SHALL derive center of mass, gravity-line support projection, signed stability margin, critical left/right angles and restoring moment from one validated analytical model with explicit units and assumptions.

#### Scenario: Lower the load
- **WHEN** a centered load moves downward while width, masses and tilt remain fixed
- **THEN** center height and support projection magnitude SHALL decrease, increasing the critical tilt magnitude

#### Scenario: Scale total mass
- **WHEN** both component masses scale equally without moving them
- **THEN** center, critical angles and margin SHALL remain unchanged while moment scales proportionally

### Requirement: Manipulable spatial and planar views
Visitors SHALL move a load in 3D or 2D, adjust width, tilt and mass with keyboard-accessible controls, and switch views without resetting state; loss of WebGL SHALL preserve all operations in 2D.

#### Scenario: Switch while exploring
- **WHEN** a visitor switches to 2D after moving the load
- **THEN** the same load position, tilt and evidence SHALL be retained with an operable load marker

### Requirement: Held preview and gravity-driven release
The experiment SHALL distinguish held initial poses from released motion, reject artificial falling for stable or exactly critical poses, evolve unstable tipping from torque and inertia, and stop at first ground contact with the contact-model limitation explained.

#### Scenario: Release past the edge
- **WHEN** the support projection is outside the base and the visitor releases the clamp
- **THEN** the body SHALL tip about that edge under gravity, show live elapsed time/rotation/angular speed and stop at first side contact

### Requirement: Demonstration and transferable learning
The page SHALL offer two controllable standard demonstrations, a prediction, a fixed-tilt stability challenge and a physical activity; no animation SHALL autoplay, manual changes SHALL cancel demonstrations and backgrounding SHALL pause them.

#### Scenario: Solve a transport challenge
- **WHEN** a visitor secures the load with at least 3 cm margin at the specified 20-degree tilt
- **THEN** the challenge SHALL recognize the result; reducing the tilt alone SHALL not satisfy the task

