# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-06

## Last change
Deleted 2 dead files (ProcessMenu.svelte, FileProperties.svelte — ~1,550 lines), removed orphaned Rust commands (compress_media, write_cover_art, add_dir_to_zip — 175 lines), removed runClipAction stub from clips.svelte.ts, removed their invoke wrappers from tools.ts, stripped runClipAction prop wiring through +page.svelte/Shell/Dialog, and made Cast/Transcriptor share buttons placeholder no-ops. Both pnpm check and cargo check pass with 0 errors.

## Status
- ProcessMenu.svelte — deleted (dead convert/compress UI, never imported)
- FileProperties.svelte — deleted (dead standalone dialog, never imported)
- compress_media / write_cover_art / add_dir_to_zip — removed from Rust backend
- invokeCompressMedia / invokeWriteCoverArt — removed from tools.ts
- runClipAction — removed from clips.svelte.ts and prop chain (was a no-op stub)
- Cast button — changed to placeholder no-op (was misleadingly calling openInDefaultApp)
- Transcriptor button — changed to placeholder no-op (was showing placeholder toast)
- FeedbackDialog / AccessibilityDialog / SettingsDialog / AboutDialog — left as-is (intentional placeholders)
- All other modules — working

## Next
Extract createNavigation config into a navigationHelpers factory (largest remaining inline config block, ~55 lines of getter/setter closures).

## Bugs found this session
- None

## Current commit
chore: strip dead process menu, file props, compress, cover art, clip

## Architecture update
_Only if a genuinely new module/concern was added this session that has no existing row in ARCHITECTURE.md —
add the minimum rows needed to the module ownership table. Do not rewrite, reformat, or touch anything else._
- None — no new modules added
