## Context
Eleven Astro/TypeScript/Three.js labs exist with independent science models and same-state planar fallback. The user requests realistic moon/eclipses followed by a unified review of recent experiments. Keep the bright museum site and original subject-specific experiences.

## Goals / Non-Goals
Goals: convincing textured celestial spheres, correctly oriented phase portrait, angular-size solar disk and geometry-driven shadows; explain nodes and inclination through manipulation, evidence and demonstrations. Keyboard/touch/mobile/failure support. Review lens, Mobius and balance after delivery.
Non-goals: real-date eclipse forecasting, arbitrary location ephemerides, full atmospheric/radiative simulation, eye-safety direct-Sun observation, accounts or course infrastructure.

## Decisions
- Use Earth-radius physical units (Earth 1, Moon .2727, Sun 109.1; mean Earth–Sun 23455; selectable Moon distance 56–64). A circular inclined lunar orbit with adjustable node provides teaching snapshots. Synodic day is an approximate phase mapping, not a date ephemeris.
- Geocentric phase is k=(1+dot(Moon→Sun,Moon→Earth))/2. Northern-up observer portrait uses a projected ecliptic north and the actual light vector; no Earth shadow in ordinary phases.
- Local solar occultation is uniform angular-disk overlap at a clearly marked subsolar equatorial surface point. Distances can produce total and annular examples. Name local results honestly instead of claiming global visibility.
- Lunar classification uses the umbral/penumbral cross-section perpendicular to the Sun–Earth axis and Moon disk overlap. Per-surface sunlight blockage uses finite-source angular disk overlap, so 3D and portrait darkening follow physical geometry. Totality has an explicitly approximate red atmospheric contribution.
- Full-system distances are compressed for manipulability; all shadows and labels use physical evidence. Render planets with local NASA textures and a subject-specific shader for finite-source occlusion. No fake shadow-map eclipse from compressed geometry. 2D shows a labeled geometry diagram plus the same sky portraits/evidence.
- Design signature: a dark-blue instrument viewport paired with a large textured moon portrait and a smaller solar disk, surrounded by bright ice-white museum content. Palette: space #091b30, ice #f3f8fc, earth #348ad0, moon #c6d0dc, sunlight #ffc86b, red totality #ad563e. Existing Noto Sans SC for prose, IBM Plex Mono for data. Quiet controls with one primary play action; separate event presets and orbital controls. No generic card wall.
- Two demos: one lunar cycle, and full moon off-node versus at-node. Pause/resume/manual takeover/background pause, reduced-motion steps, dispose and bfcache return. Lazy 3D only on lab route.

- After the astronomy delivery, improve recent labs with readable sRGB canvas labels and a compact mobile observation strip shown only while off-stage controls are visible. Mirror existing readouts; do not create a second model or new persistent state. Preserve subject-specific layouts.

## Risks / Trade-offs
- Compressed geometry could imply wrong eclipse size → state display scaling explicitly and calculate shadow visibility independently with physical units.
- Angular overlap is uniform brightness/small-angle planar approximation → document no limb darkening/refraction, dates or precise local predictions. Red totality is illustrative, not measured color.
- Texture sources unavailable → verify/download NASA assets locally with attribution; shaders work without textures and report a plain-sphere fallback.
- Canvas image work costs on mobile → bounded 192–224px portrait, cached surface data, demand/limited-frame updates.
- Educational effectiveness unknown → browser/model validation and documented future adolescent formative testing.
