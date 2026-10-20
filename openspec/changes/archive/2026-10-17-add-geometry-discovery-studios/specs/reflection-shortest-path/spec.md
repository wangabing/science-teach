## ADDED Requirements

### Requirement: Reflection and constrained shortest path
The studio MUST compute reflection distance equality, path length, unrestricted optimum and interval-constrained optimum from A and B above y=0. P SHALL remain on the allowed straight line or segment.

#### Scenario: Default minimum
- **WHEN** A=(-4,3), B=(4,5) and P is unrestricted on the baseline
- **THEN** the optimal P is(-1,0), minimum is sqrt(128) and PB equals PB-prime

#### Scenario: Minimum outside allowed segment
- **WHEN** the permitted interval is [-5,-2] for the default points
- **THEN** the actual minimum occurs at P=(-2,0), and the unrestricted point is marked inadmissible

### Requirement: Independent path finding
The studio SHALL accept manual movement near the true optimum only after task preparation, with explicit numeric tolerance, and SHALL NOT award credit for revealing the reference answer.

#### Scenario: Reference solution
- **WHEN** the reference optimum is applied
- **THEN** the path updates but independent task completion is cleared
