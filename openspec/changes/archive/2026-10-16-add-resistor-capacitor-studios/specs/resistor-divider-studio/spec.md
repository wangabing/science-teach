## ADDED Requirements

### Requirement: Loaded divider evidence
The studio SHALL compute output voltage, branch currents and resistor powers for an ideal-source divider with a removable load, expose units and an unloaded reference, and account for source power.

#### Scenario: Load reduces output
- **WHEN** E=6 V and both divider resistors are1000 Ω
- **THEN** unloaded output is3 V and source current3 mA, while a1000 Ω load reduces output to2 V and source current becomes4 mA

### Requirement: Independent resistance task
The studio SHALL prepare a6 V unloaded task with lower resistance1000 Ω and upper resistance500 Ω, accept a manual upper resistance adjustment yielding3 V±0.05 V, and invalidate success after presets, restoration or other conditions change.

#### Scenario: Student divides voltage
- **WHEN** a student prepares the task and manually adjusts upper resistance to1000 Ω
- **THEN** current output3 V is identified as independent success, and connecting the load clears that success

### Requirement: Accessible observations and route
The studio SHALL provide two current-page snapshots, recomputed restoration, unit-bearing CSV, changed-condition comparison, historical context, model boundaries and links to the wiring/capacitor experiments. Primary operations MUST work by keyboard and at390 px, with readable no-script explanation.

#### Scenario: Reproduce loaded measurement
- **WHEN** a student saves unloaded and loaded conditions, then restores unloaded conditions
- **THEN** measurements recompute to the original values and completion is not restored
