## ADDED Requirements

### Requirement: Rigid and flexible triangle states
The studio SHALL preserve two known side lengths while an unlocked hinge moves, and preserve all three sides after locking by deriving valid upper/lower mirror constructions. It MUST distinguish strict triangle inequality, collinear degeneracy and impossible lengths.

#### Scenario: Mirror congruence
- **WHEN** a valid third side is locked and the student flips the construction
- **THEN** all side lengths and area magnitude remain unchanged and orientation reverses

#### Scenario: Degenerate lengths
- **WHEN** the sides are1,2,3
- **THEN** the model reports a degenerate line rather than a valid triangle

### Requirement: Constraint discovery
The first task SHALL require actual hinge movement followed by locking and flipping. General SSS congruence and a condition-changing question SHALL remain separate from the numeric observation.

#### Scenario: Attempt unlocked flip
- **WHEN** the student flips before locking
- **THEN** the independent lock-and-flip task is not marked complete
