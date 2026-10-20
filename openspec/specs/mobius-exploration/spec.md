# mobius-exploration Specification

## Purpose
Provide model-consistent paper-strip tracing, center-cut prediction and physical verification for teenagers.
## Requirements
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

### Requirement: Progressive center cutting
The lab SHALL expose center-cut progress separately from tracing, render only the completed angular segment as cut and retain the uncut connection elsewhere, with manual scrubbing and controlled animation.

#### Scenario: Inspect a partial cut
- **WHEN** cut progress is 25, 50 or 75 percent
- **THEN** the slit and cutting marker SHALL end at the corresponding centerline angle in 2D and 3D; feedback SHALL explain remaining connection without announcing final component counts or prediction results.

#### Scenario: Control or interrupt cutting
- **WHEN** the visitor pauses, scrubs, restores, resets, changes strip type or backgrounds the page
- **THEN** scheduled cutting SHALL pause or stop as appropriate without later overwriting manual state; reduced motion SHALL allow deliberate manual progress without automatic cutting.

### Requirement: Trace each cut component
After full center cutting the lab SHALL allow selection of every connected component and tracing its surface, original edge or newly cut edge to its own starting position using the same seam geometry in both views.

#### Scenario: Trace both even-twist components
- **WHEN** zero or two half twists are fully cut and a visitor selects the second component
- **THEN** marker and path SHALL lie on that component, complete in one center circuit and return to their start; a newly cut boundary SHALL be distinguishable from the original outer boundary.

#### Scenario: Trace the single Mobius cut component
- **WHEN** one half twist is fully cut
- **THEN** one two-sided component SHALL be selectable, its closed path SHALL require two center circuits and it SHALL retain both new and original boundary options.

#### Scenario: Rewind cutting
- **WHEN** the visitor moves cut progress back below 100 percent or restores the strip
- **THEN** cut-component selection SHALL reset and remain unavailable until the full cut is complete, and evidence SHALL describe the unfinished or uncut strip.

