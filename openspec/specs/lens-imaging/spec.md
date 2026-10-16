# lens-imaging Specification

## Purpose
TBD - created by archiving change add-lens-imaging-experience. Update Purpose after archive.
## Requirements
### Requirement: Model-consistent convex lens exploration
The lens lab SHALL derive image distance, signed magnification, ray positions, image classification and formula substitution from one ideal thin-lens model with centimeter units and explicit assumptions.

#### Scenario: Cross the focus
- **WHEN** the object moves through 3f, 2f, 1.5f, f and 0.6f
- **THEN** it produces respectively reduced inverted real, equal inverted real, enlarged inverted real, no finite image and enlarged upright virtual cases, with no NaN or invalid SVG coordinates.

### Requirement: Independent screen and readable evidence
Visitors SHALL independently move a screen, compare geometric ray separation, read numerical evidence and record up to six observations; virtual-image extensions and theoretical images SHALL be distinguished from light reaching the screen.

#### Scenario: Focus a real image
- **WHEN** f=10, u=30 and screen=15
- **THEN** v=15 and m=-0.5 are shown, ray separation is zero and the screen preview indicates focus; moving the screen changes the preview without changing v.

#### Scenario: Virtual and out of range images
- **WHEN** an image is virtual or outside the view or screen travel
- **THEN** the lab explains that condition and does not depict a clear real projection or silently clamp image distance.

### Requirement: Guided creative learning
The lab SHALL offer five labeled presets, a prediction with explanatory feedback, three verifiable challenges, standard image-transition and screen-focus demonstrations, pause/resume/restart and reset.

#### Scenario: Manual takeover
- **WHEN** a visitor edits parameters, drags, chooses a preset/challenge or resets during a demo
- **THEN** scheduled changes stop and do not overwrite manual state; pause and page hide freeze animation, and reset restores defaults and clears session observations.

### Requirement: Accessible discoverable optics
The lab SHALL be reachable from physics, home and catalog with correct counts, work at 320/390px with keyboard and touch alternatives, avoid autoplay and repeated live announcements, respect reduced motion and retain meaningful static content without JavaScript.

#### Scenario: Explore on a small or static page
- **WHEN** visitors use keyboard, reduced motion, mobile or disabled scripting
- **THEN** essential controls or static formulas, diagram and model explanation remain readable with no page horizontal overflow.

