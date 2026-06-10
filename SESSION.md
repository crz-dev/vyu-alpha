# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-09

## Last change
Made the font dropdown separator between system fonts (Courier New) and app fonts (Geist, Satoshi) much more visible. Changed from 1px at `rgba(255,255,255,0.18)` to 2px at `var(--bg-border)` (app's standard border color) with `border-radius: 1px`, matching the `.edit-menu-separator` pattern.

File changed: `components.css`.

## Status
- Type check: clean
- Formatter: clean
- Rust build: untested

## Next
Text word wrapping / multi-line support.

## Bugs found this session
- Fixed: font menu size input did not update live when dragging diamond handles to resize text.
- Fixed: underline positioned at em-square middle + 2px (way above baseline); strikethrough positioned at em-square middle - 30% font size (above x-height).
- Fixed: font dropdown separator between Courier New and Geist was barely visible (1px at 18% white opacity).

## Current commit
style: make font dropdown separator more visible

## Architecture update
- None.
