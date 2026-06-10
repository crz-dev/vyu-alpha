# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-09

## Last change
Fixed file navigation not loading next/prev files when skipping through a folder. Root cause: two separate issues. (1) Security hardening in commit faa654f narrowed fs:scope and assetProtocol.scope from `"**"` to `$HOME/**`, breaking `readDir`/`stat` + `convertFileSrc` URLs for files outside the home directory — reverted both to `"**"`. (2) `displayFile()` was called without `await` in `navigate`, `navigateToEdge`, `navigateToIndex`, and `advanceSlide`, leaving `fileSrc` stuck at `""` on unhandled async errors — made all four functions async with proper `await`. Added `{#key fileSrc}` in ImageView and VideoView to force element recreation on src change.

Files changed: `capabilities/default.json`, `tauri.conf.json`, `media.svelte.ts`, `navigation.svelte.ts`, `playbackHelpers.ts`, `ImageView.svelte`, `VideoView.svelte`.

## Status
- Type check: clean
- Formatter: clean
- Rust build: untested

## Next
Text word wrapping / multi-line support.

## Bugs found this session
- Fixed: fs:scope restricted to `$HOME/**` broke `readDir`/`stat` for files outside home directory — folder scanning failed silently, leaving `fileList` empty.
- Fixed: assetProtocol.scope restricted to `$HOME/**` broke `convertFileSrc` URLs for files outside home directory.
- Fixed: `displayFile` not awaited in `navigate`/`navigateToEdge`/`navigateToIndex`/`advanceSlide` — unhandled async errors left `fileSrc` at `""`, preventing next file from loading.

## Current commit
fix: await displayFile in navigation, widen fs and asset protocol scopes

## Architecture update
- None.
