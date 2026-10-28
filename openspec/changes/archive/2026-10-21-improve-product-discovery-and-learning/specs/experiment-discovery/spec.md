## ADDED Requirements

### Requirement: Curated first experiments
The homepage SHALL feature four reviewed starting experiments, one per space, with a suitable question, first action and expected observation, while retaining all 140 routes in the complete directory.

#### Scenario: Choose a starting point
- **WHEN** a visitor opens the homepage
- **THEN** four curated cards explain how to start and the full catalog remains accessible

### Requirement: Searchable progressively enhanced directory
The directory SHALL search names, questions, topics and curated synonyms, filter by space and authored exploration goal, preserve q/space/goal in shareable URLs and support back navigation. Unknown prerequisites SHALL NOT be fabricated. Without JavaScript all entries SHALL remain readable.

#### Scenario: Search and recover from no matches
- **WHEN** a visitor searches 放大镜 then an unmatched query
- **THEN** lens is found first and an empty result provides a clear reset action

#### Scenario: Open a shared filter
- **WHEN** a filtered URL is reopened or browser history is traversed
- **THEN** controls and matching results reflect the URL
