# Session state

_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-10

## Last change

Added global "Glow" appearance setting in Settings → Appearance (below Theme) with 4-stop intensity slider (Off/Low/Med/High). Replaced white box-shadow with per-color filter: drop-shadow() on SVG icons and text across all interactive controls — buttons, diamond handles, toggles, markers, share overlay, properties menu, audio transport, EQ controls, dialog buttons, color swatches, settings nav, and more. Reduced EqualizerMenu formatting noise and fixed Bass Boost preset name.

## Status

- Glow setting: working (4 levels, persisted to localStorage, data-glow-level on <html>)
- Type check: passing
- EqualizerMenu: working (includes lingering preset name fix + bypass logic from previous session)

## Next

Text word wrapping / multi-line support.

## Bugs found this session

- None.

## Current commit

feat: add glow appearance setting with intensity slider

## Architecture update

- `src/lib/features/glow/glow.svelte.ts` — new glow store singleton (level getter, setLevel, localStorage persistence)
- `src/lib/styles/glow.css` — new glow stylesheet with 3 intensity tiers targeting all interactive controls
