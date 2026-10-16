## ADDED Requirements

### Requirement: Operable spatial stages
The labs SHALL provide camera presets, keyboard camera controls, responsive framing, demand rendering and scene disposal. WebGL failure or loss SHALL expose an operable two-dimensional view with the current state.

#### Scenario: Context unavailable
- **WHEN** a stage cannot create or retain WebGL
- **THEN** the visitor SHALL continue manipulating the same model through the fallback and controls

### Requirement: Optical bench with projected pattern
The lens lab SHALL show a recognizable luminous pattern, a draggable object and screen, 0.1 cm adjustment, three-dimensional viewpoints and same-model optical evidence. Opaque screens SHALL stop representative rays.

#### Scenario: Independent focus
- **WHEN** the visitor moves the screen away from the computed image plane
- **THEN** the projected pattern SHALL blur while the theoretical image distance remains unchanged

#### Scenario: Virtual image
- **WHEN** the object is within the focal distance
- **THEN** the screen SHALL show no focused pattern and the virtual image SHALL be explicitly distinguished from actual light
