## ADDED Requirements

### Requirement: Signed coherent-source displacement model
The lab SHALL compute equal-amplitude monochromatic radial phase fields and their linear displacement sum from source distance, wavelength, phase and simulation time. It SHALL expose signed displacements in mm, distances/wavelength in cm, frequency in Hz, simulation time in s, and whole-cycle amplitude independently from instantaneous displacement. The ideal steady-field assumptions, lack of radial attenuation/reflections/startup propagation, and distinction from light intensity SHALL be visible.

#### Scenario: Central cancellation persists through time
- **WHEN** two equal sources have180° phase difference and the probe is equidistant from both
- **THEN** whole-cycle amplitude and displacement sum are zero within numerical tolerance at all sampled times while the individual components may remain nonzero.

### Requirement: Interactive ripple field and accessible probe
The lab SHALL show source positions, signed ripple displacement, probe location, source-to-probe distances and two component curves plus their sum over one period. It SHALL support single-source and double-source modes, wavelength/separation/phase controls, pointer probe manipulation and equivalent keyboard and slider controls. The field and evidence SHALL use the same model state.

#### Scenario: Move probe and inspect evidence
- **WHEN** a visitor moves the probe using pointer, arrow keys or coordinate controls
- **THEN** position, distances, displacement, whole-cycle amplitude and curves update consistently and remain readable without color alone.

### Requirement: Independent quiet-point task and transfer prediction
The lab SHALL offer an optional first task starting with two sources, wavelength4 cm, separation6 cm, phase0° and central probe. Only manual phase adjustment while keeping the other conditions fixed SHALL complete it, using whole-cycle amplitude≤0.1 mm. Other condition changes or examples/restoration SHALL exit independent task credit. A follow-up prediction SHALL ask whether one zero displacement proves persistent cancellation and give evidence-based feedback after selection.

#### Scenario: Instantaneous zero is insufficient
- **WHEN** a probe's instantaneous displacement is near zero but whole-cycle amplitude exceeds0.1 mm
- **THEN** the lab does not grant quiet-point success and the feedback directs attention to amplitude and the full-period curve.

### Requirement: Bounded comparison records with honest restoration and export
The lab SHALL explicitly retain up to two current-page condition/evidence records, identify changed conditions, restore conditions with model recomputation while paused, and export recorded numeric evidence as CSV with units and model version. It SHALL state replacement and refresh behavior and SHALL NOT invent missing history.

#### Scenario: Restore and export an observation
- **WHEN** a visitor saves a state, edits controls, restores it and exports records
- **THEN** restored numerical evidence matches the saved conditions/time, animation remains paused, independent task credit is cleared, and CSV fields include the actual conditions, units, source components and amplitude.

### Requirement: Deliberate motion, fallback and catalog integration
The lab SHALL load paused and provide play/pause and single-step controls, pause when hidden or departed, respect reduced motion, avoid per-frame live announcements, and work at320px without page overflow. Canvas failure SHALL retain operable probe evidence and curves with an explicit message; no-JavaScript visitors SHALL receive a static explanation. The experiment SHALL appear in the physical-space and full catalogs with a dedicated illustration and accurate counts.

#### Scenario: Explore without automatic motion
- **WHEN** a visitor loads the lab with reduced motion or Canvas rendering unavailable
- **THEN** no animation starts automatically, controls still update scientific evidence, and any unavailable visualization is clearly described.
