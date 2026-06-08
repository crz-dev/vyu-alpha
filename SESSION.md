# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-08

## Last change
Consolidated `CropBounds` into `shared/types.ts`, removed dead code. Extracted `formatMetaDate`/`getMetaValue` into new `shared/file-meta.ts`. Removed redundant `isDocument()` wrapper. DRYed duplicated `anyMenuOpen`/`areDialogsOpen` boolean logic into shared function in `menuVisibility.svelte.ts`. Renamed `features/edit/` to `features/edit-dialogs/` to disambiguate from `features/editing/`. Split `features/dialogs/` into `features/stores/`, `features/actions/`, and pure-component `dialogs/`. Moved `prepareDisplayPath` to `sources.ts`. Extracted window-state functions from `util.rs` into new `window_state.rs`. Documented `svg` extension asymmetry.

## Status
- Type check: clean (0 errors, 0 warnings)
- Rust build: clean
- Formatter: clean

## Next
Pick up the next open issue or feature request.

## Bugs found this session
- None.

## Current commit
refactor: consolidate types, split dialogs/stores/actions, extract utilities

## Architecture update
- `features/stores/*` — menu and context-menu state (split from dialogs/)
- `features/actions/*` — context actions, properties, global mouse handler (split from dialogs/)
- `features/edit-dialogs/` — edit apply/export orchestration (renamed from edit/)
- `shared/file-meta.ts` — file metadata date/value extraction helpers
- `window_state.rs` — window position/size save/restore (split from util.rs)
