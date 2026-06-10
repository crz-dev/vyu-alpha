# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-09

## Last change
Unified markup transform handles across shapes and text: 4 corner-only diamonds with white bounding-box outline on all shape types. Side resizing works by grabbing any part of the outline edge (line-segment hit testing). Rotate circle gap reduced from 22→16px. Text delete button moved to top-right corner matching shape position. Text corner diamonds now resize both boxExtraWidth and fontSize (was moving text instead — removed center adjustment). Added drag-to-place text boxes (like shapes) with sized font/width on drag, default on click. Text max font size raised 72→200. Handle/outline/delete opacity reduced to 80%. Fixed bug where toggling shape/draw/highlight rows didn't deactivate text mode (causing text boxes to still be placed).

## Status
- Type check: clean
- Formatter: clean
- Rust build: untested

## Next
Text word wrapping / multi-line support.

## Bugs found this session
- Fixed: toggleShapes/draw/highlight didn't deactivate textActive — clicking canvas would still place text boxes.
- Fixed: text corner drag applied ldx/ldy to normalized position, moving the text box instead of resizing it.
- Fixed: toggleShapes called closeAllRows() which closed drawRowOpen — shapes sub-row is inside {#if drawRowOpen}, making it invisible.

## Current commit
refactor: unify markup transform handles with corner diamonds and bounding-box outline

## Architecture update
- None.
