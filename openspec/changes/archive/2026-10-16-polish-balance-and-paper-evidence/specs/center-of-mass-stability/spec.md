## ADDED Requirements

### Requirement: Fixed-condition height comparison
The lab SHALL capture a reference A and compare B while keeping tilt, width, both masses and lateral position fixed, exposing only load height within comparison mode and reporting model-derived evidence for both states.

#### Scenario: Change only height
- **WHEN** a visitor retains A and lowers B using the comparison controls or direct load manipulation
- **THEN** all other conditions SHALL remain equal, and both support projections, margins, critical angles and moments SHALL remain visible for comparison at 320/390px without page overflow.

#### Scenario: Return to free exploration
- **WHEN** a visitor exits comparison or chooses a preset or demonstration
- **THEN** fixed-condition restrictions SHALL end with clear feedback, without allowing an uncontrolled change to be described as a height-only comparison.

### Requirement: Prediction before mass transfer verification
After a valid transport challenge the lab SHALL offer a prediction about scaling all masses equally, then verify a snapshot with both masses doubled in an independent comparison using the analytical model.

#### Scenario: Verify the same geometry with doubled masses
- **WHEN** a visitor predicts and requests mass doubling after passing the challenge
- **THEN** original and doubled component masses, critical angles, margins and moments SHALL be shown; the critical angle and margin SHALL remain equal and the moment SHALL double, with feedback explaining the canceled mass ratio.

#### Scenario: Avoid stale verification
- **WHEN** the main apparatus changes after challenge success
- **THEN** the saved transfer activity SHALL become unavailable until a valid challenge is checked again.
