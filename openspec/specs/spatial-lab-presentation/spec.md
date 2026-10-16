# spatial-lab-presentation Specification

## Purpose
Provide operable three-dimensional apparatus with quantitative two-dimensional evidence and state-preserving fallback.
## Requirements
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

### Requirement: Mobile observation during parameter adjustment
Recent spatial labs SHALL expose compact same-model evidence and an operable return-to-stage action while mobile parameter controls are visible and the stage has scrolled away. The observation strip SHALL remain hidden during stage viewing, explanatory reading and desktop use.
#### Scenario: Adjust away from the stage
- **WHEN** a visitor changes a parameter in mobile controls after the stage scrolls away
- **THEN** compact evidence SHALL update from existing readouts and the visitor SHALL be able to return to the experiment view without resetting parameters

