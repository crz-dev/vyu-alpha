# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-07

## Last change
Split 3219-line `lib.rs` into 13 files under `src-tauri/src/`: `constants.rs`, `types.rs`, `util.rs`, `commands/{thumbnail,display,editing,conversion,clips,file_ops,clipboard,integrity,external_apps}.rs`. Fixed non-deterministic `hash_path` bug (replaced `DefaultHasher` with `hash_path_xxh3`). Removed duplicate `ts`/`m2ts` from `BROWSER_UNSUPPORTED_VIDEO_EXTS_RUST`. Extracted `check_cache()` and `resolve_output_path()` helpers. Added 16 unit tests. Updated AGENTS.md, BLUEPRINT.md, README.md references.

## Status
- Rust backend: fully modular — `lib.rs` is ~170 lines (only `run()` + `setup()`)
- 16 unit tests passing, zero warnings
- Doc references updated

## Next
Pick up the next open issue or feature request.

## Bugs found this session
- `navigation.svelte.ts` lines 77–78: `markup.cleanup()` called twice consecutively (pre-existing)

## Current commit
refactor: split lib.rs into domain modules, fix hash_path bug, add tests

## Architecture update
Rust backend now uses domain modules under `src-tauri/src/`:
- `constants.rs` — extension lists, magic numbers
- `types.rs` — shared structs (`MediaKind`, `ThumbState`, etc.)
- `util.rs` — helpers (`run_ffmpeg`, `hash_path_xxh3`, `check_cache`, etc.)
- `commands/` — one module per command group
