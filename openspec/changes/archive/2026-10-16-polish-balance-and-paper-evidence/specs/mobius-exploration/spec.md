## ADDED Requirements

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
