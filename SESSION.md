# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-09

## Last change
Two fixes in text markup. (1) Live font size display: when dragging diamond handles on a text box to resize, `markup.textFontSize` now updates in real time so the font menu number input reflects the current size. Added a `set textFontSize` setter to the markup store (matching `drawActive`/`highlightActive` pattern). (2) Underline and strikethrough Y positions were calculated relative to the em-square middle without accounting for the baseline offset — both appeared too high on the text. Changed underline from `textMid + 2px` to `textMid + fontSize * 0.4` (near baseline), and strikethrough from `textMid - fontSize * 0.3` to `textMid + fontSize * 0.05` (through x-height region).

Files changed: `DrawOverlay.svelte`, `markup.svelte.ts`.

## Status
- Type check: clean
- Formatter: clean
- Rust build: untested

## Next
Text word wrapping / multi-line support.

## Bugs found this session
- Fixed: font menu size input did not update live when dragging diamond handles to resize text.
- Fixed: underline positioned at em-square middle + 2px (way above baseline); strikethrough positioned at em-square middle - 30% font size (above x-height).

## Current commit
fix: live font size display on drag, reposition underline/strikethrough

## Architecture update
- None.
