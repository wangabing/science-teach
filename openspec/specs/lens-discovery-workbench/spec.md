# lens-discovery-workbench Specification

## Purpose
TBD - created by archiving change polish-lens-discovery-workbench. Update Purpose after archive.
## Requirements
### Requirement: A clear first focus action
The lens lab SHALL offer an optional first-focus activity before advanced choices while preserving free exploration, existing controls and meaningful static content.

#### Scenario: Focus without a demonstration
- **WHEN** a visitor starts first focus
- **THEN** the lab prepares f=10, u=30, s=8 and asks the visitor to move the screen; manual focused state completes the activity, and demonstrations cannot complete it.

### Requirement: Observe while adjusting on mobile
At 320 and 390 CSS pixels the lens lab SHALL keep a compact model-consistent screen preview visible while adjusting parameters, without page horizontal overflow.

#### Scenario: Screen distance changes
- **WHEN** the visitor changes screen distance in the mobile control area
- **THEN** the adjacent preview updates blur, image and state consistently with the main preview, including virtual and focus conditions.

### Requirement: Model grounded next-step feedback
The lab SHALL distinguish virtual images, focal-point parallel rays, images beyond screen travel, target-size mismatch and defocus when checking a real-image challenge.

#### Scenario: Correct size but defocused
- **WHEN** the image size matches the selected real-image challenge but the screen is defocused
- **THEN** feedback identifies size as correct and indicates which way to move the screen.

#### Scenario: No reachable real image
- **WHEN** a real-image challenge has a virtual image, focal-point condition or image beyond 100 cm
- **THEN** feedback explains the specific cause and an actionable change rather than suggesting screen adjustment alone.

### Requirement: Durable restorable evidence
The lab SHALL save at most six validated observations locally, restore a selected observation through the model, and explain storage limits or failure. Reset and clear SHALL remove saved observations.

#### Scenario: Reload and restore
- **WHEN** the visitor records conditions, reloads and restores a row during a demonstration
- **THEN** its numeric parameters and extension visibility return, the demo stops, and derived evidence is recomputed.

#### Scenario: Unavailable or invalid storage
- **WHEN** storage is denied or saved data is malformed or outside supported ranges
- **THEN** the lab remains operable, invalid data does not reach the model or HTML, and the visitor receives a storage status.

### Requirement: Compare controlled evidence
The notebook SHALL compare the most recent two records, naming fixed conditions and changed variables, without attributing multi-variable changes to one cause.

#### Scenario: Two focused real images
- **WHEN** two records share focal length and differ in object distance with both screens focused
- **THEN** comparison reports object-distance and image-distance change and identifies shared focal length.

#### Scenario: Confounded observations
- **WHEN** focal length and object distance both differ
- **THEN** comparison reports both changes and asks the visitor to fix focal length before interpreting the object-distance relationship.

