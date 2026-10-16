# moon-phases-and-eclipses Specification

## Purpose
Provide a manipulable dual-view astronomy observatory that explains moon phases and eclipses using shared physical geometry, convincing light and shadow, accessible fallbacks and guided exploration.
## Requirements
### Requirement: Physical phase and eclipse evidence
The lab SHALL derive phase fraction, angular radii, local solar disk occultation and lunar umbra/penumbra classification from shared physical radii, distance, orbit inclination and node parameters, with explicit approximation and observation-location labels.
#### Scenario: Full moon away from a node
- **WHEN** the Moon is near opposition with realistic inclination and away from a node
- **THEN** the portrait SHALL remain nearly full without falsely applying an Earth shadow, and evidence SHALL explain the missed eclipse
#### Scenario: Align eclipse geometry
- **WHEN** new or full moon coincides with an orbital node
- **THEN** local solar or lunar eclipse evidence SHALL reflect the corresponding physical occultation and distinguish total, partial, annular or penumbral conditions where applicable

### Requirement: Convincing dual-view presentation
The lab SHALL offer textured, correctly illuminated celestial bodies, an Earth-view Moon portrait and local solar disk, together with manipulable 3D and same-state 2D geometry; the compressed display scale SHALL be identified and SHALL NOT determine eclipse calculations.
#### Scenario: Switch geometry views
- **WHEN** a visitor drags the Moon or adjusts phase and switches 3D/2D
- **THEN** orbit parameters, phase portrait and eclipse evidence SHALL remain unchanged and operable

### Requirement: Accessible operation and graceful lifecycle
Keyboard/touch controls, 320px layout, reduced-motion operation, WebGL/texture fallback, background pause, disposal and cached-page return SHALL preserve usable experiment state.
#### Scenario: Lose WebGL
- **WHEN** the active WebGL context is lost
- **THEN** the same-state 2D diagram, sky views and parameter controls SHALL remain available without a reset

### Requirement: Guided astronomical exploration
The page SHALL provide controllable standard demonstrations, a prediction, an eclipse-alignment challenge, live formula substitution and a lamp/ball physical activity; manual parameter changes SHALL stop demonstrations and no motion SHALL autoplay.
#### Scenario: Find a lunar eclipse
- **WHEN** a visitor aligns full moon and a node under the challenge's realistic inclination
- **THEN** the challenge SHALL recognize actual lunar totality while setting inclination to zero alone SHALL not satisfy the task

