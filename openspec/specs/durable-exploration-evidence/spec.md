# durable-exploration-evidence Specification

## Purpose
Preserve personal investigation conditions and explanations on reviewed pilot experiments while keeping model validity and the limits of learning evidence explicit.

## Requirements

### Requirement: Durable personal discoveries on six pilots
Lens, sections, moon, bridge, belt-drive and tidal-roche SHALL offer explicit local saving of two condition snapshots and a personal explanation with storage-format and model versions. Existing temporary notebooks and lens six-record behavior SHALL remain accurate. Storage failure SHALL preserve current-page operation and report the actual status.

#### Scenario: Save reload compare and restore
- **WHEN** a visitor saves two conditions, reloads and restores one
- **THEN** inputs are validated and reapplied, the model recomputes, playback pauses and independent credit is cleared without restoring unsaved trajectories

#### Scenario: Invalid or denied storage
- **WHEN** storage is unavailable or a saved record has an unknown version or invalid inputs
- **THEN** the model is not given invalid data and the visitor can continue with an accurate status and clear action

### Requirement: Explanations tied to evidence and model boundaries
Each pilot SHALL provide a subject-specific prediction or transfer question, an optional personal explanation, prerequisites, separate intuitive/quantitative guidance, dual-view purpose and a model card with source location, units, limits and an independent check. Personal writing SHALL NOT be marked as demonstrated mastery.

#### Scenario: Revisit an explanation
- **WHEN** a visitor saves an explanation with current conditions and returns later
- **THEN** the writing remains associated with those conditions and a new-condition prompt is available without automatic grading
