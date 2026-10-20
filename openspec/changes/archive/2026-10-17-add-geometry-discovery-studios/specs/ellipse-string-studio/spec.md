## ADDED Requirements

### Requirement: Focal definition and axes
The studio MUST derive constrained P, distances to both foci, axis lengths, eccentricity and standard equation for a>c>=0, show a circle when c=0, and distinguish a=c degeneration from a<c impossibility.

#### Scenario: Valid ellipse
- **WHEN** a=5, c=3 and P is moved around the curve
- **THEN** b=4, focal distances sum to10 and x²/25+y²/16=1

#### Scenario: Excess focal separation
- **WHEN** c becomes greater than or equal to a
- **THEN** the display explains invalid or degenerate status and does not report a valid ellipse equation or task success

### Requirement: Actual pencil evidence
The studio SHALL distinguish the analytic guide from manually sampled trace, clear actual trace after shape changes/restoration, and require two manually reached positions for the guided distance-sum observation.

#### Scenario: Restoring parameters
- **WHEN** a saved point is restored
- **THEN** the point and measurements recompute, old trace clears and independent credit is not restored
