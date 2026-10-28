# exploration-trails Specification

## Purpose
TBD - created by archiving change add-lens-imaging-experience. Update Purpose after archive.
## Requirements
### Requirement: Short question-led exploration trails
The site SHALL present freely accessible short routes connecting optics, area/sections, gears/bridge and orbit/three-body using actual catalog entries, concrete observation questions and a next-step link on participating independent and shared-workbench pages. Each transition MUST explain its conceptual connection. Route context SHALL be preserved in links; experiments on multiple routes SHALL expose a choice or use explicit route context rather than silently selecting the first route. Trail entry SHALL precede the full directory list.

#### Scenario: Follow a question
- **WHEN** a visitor opens a route from the experiment catalog or space directory
- **THEN** they can open real experiments in the suggested order and read what to observe, without account, locked progress or a prescribed common experiment template

#### Scenario: Continue from a shared workbench
- **WHEN** a visitor finishes a participating shared experiment with an explicit route context
- **THEN** the page offers the next actual experiment with a reason and retains that route context
