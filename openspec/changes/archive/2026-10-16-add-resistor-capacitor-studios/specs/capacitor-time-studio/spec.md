## ADDED Requirements

### Requirement: Continuous RC switching
The studio MUST use an exact RC step, preserve capacitor voltage across charge/hold/discharge switches, show signed current and separate voltage/current time traces, and reset explicitly on parameter edits.

#### Scenario: One time constant
- **WHEN** E=6 V, R=1000 Ω, C=1000 µF and zero initial voltage charge for1 s
- **THEN** voltage equals6(1−e⁻¹) V and current equals6e⁻¹ mA

#### Scenario: Hold then discharge
- **WHEN** a charged capacitor switches to hold, advances in time, then switches to discharge
- **THEN** voltage remains unchanged during hold, current is0, and discharge begins at that same voltage with negative current

### Requirement: Time and energy accounting
The studio SHALL show τ=RC, Q=CU, stored energy½CU² and cumulative source work/resistor loss from the actual simulation state. It MUST remain paused at entry, pause when hidden, avoid wall-clock catch-up and preserve source-work balance.

#### Scenario: Charge and discharge balance
- **WHEN** any sequence of charge/hold/discharge intervals is advanced from zero initial state
- **THEN** source work equals current stored energy plus cumulative resistor loss within numerical tolerance

### Requirement: Honest guided observations
The studio SHALL distinguish actual manual charging/hold/discharge observations from restored states, retain two current-page snapshots with parameters/time/voltage/cumulative work, restore paused with recomputed readouts and only a current trace point, and export SI values with model version.

#### Scenario: Restore observation
- **WHEN** a saved charged state is restored after further discharge
- **THEN** its voltage and time return, simulation is paused, old trace is cleared and independent task success is not restored

### Requirement: Accessible capacitor experience
The studio SHALL include historic context, charge-separation illustration without current crossing the dielectric, model boundaries, concentration on one first action, keyboard/mobile controls and no-script explanation.

#### Scenario: Mobile simulation
- **WHEN** a student operates the three-mode switch and single-step controls at390 px
- **THEN** current, voltage and time evidence remain readable without page overflow or requiring a drag gesture
