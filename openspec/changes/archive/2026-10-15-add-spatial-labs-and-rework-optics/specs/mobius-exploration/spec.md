## ADDED Requirements

### Requirement: Paper topology exploration
The lab SHALL compare zero, one and two half twists with rotatable paper, surface and boundary tracing, live side/boundary counts and manual progress.

#### Scenario: Trace a Mobius strip
- **WHEN** a visitor selects one half twist and traces its boundary
- **THEN** the trace SHALL traverse both local edges in two circuits and return to its starting point, with one boundary component reported

### Requirement: Center cut prediction and physical verification
The lab SHALL collect a one/two component prediction, show center cut geometry consistent with seam identification and provide a real paper activity.

#### Scenario: Cut comparison
- **WHEN** a visitor cuts one half twist down its center
- **THEN** one connected two-sided band SHALL remain; zero/two half twists SHALL produce two bands and the two-half-twist result SHALL preserve linking

### Requirement: Controlled demonstration
The lab SHALL offer start, pause/resume and scrubbing without autoplay; changing topology or manually changing progress SHALL stop the demonstration.

#### Scenario: Manual control
- **WHEN** a visitor scrubs during a trace
- **THEN** the animation SHALL stop at the chosen progress and its evidence SHALL match that progress
