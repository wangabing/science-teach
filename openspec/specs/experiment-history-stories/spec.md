# experiment-history-stories Specification

## Purpose
TBD - created by archiving change add-experiment-history-stories. Update Purpose after archive.
## Requirements
### Requirement: Complete historical context
Every catalog experiment SHALL display a concise historical question, period and introduction, with an invitation connecting that context to an available action in the current experiment.

#### Scenario: Any experiment entry
- **WHEN** a student opens any of the 13 catalog experiments
- **THEN** a tailored history introduction is present after the page introduction and the current experiment remains directly available without dismissing an overlay

### Requirement: Honest attribution and sources
Historical content MUST distinguish documented history, later anecdotes and thought experiments, include at least one named reference link per experiment, and describe limits when the current model differs from the historical context.

#### Scenario: Crown and cannon stories
- **WHEN** a student reads the buoyancy or orbit introduction
- **THEN** the crown story is identified as a later account and the cannon as a thought experiment, with source links available in expanded background

### Requirement: Accessible optional reading
Extended context, action invitation and references SHALL use a keyboard-operable native disclosure, work without JavaScript, fit mobile screens, and remain legible in the pendulum dark theme.

#### Scenario: Mobile or no script reading
- **WHEN** a student opens history details at 390 px width or with JavaScript disabled
- **THEN** the background, action invitation and sources are readable without horizontal overflow and the disclosure can be opened and closed using a keyboard

