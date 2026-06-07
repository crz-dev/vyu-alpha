# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-07

## Last change
Full code audit fixes across Rust backend and TS/Svelte frontend: replaced non-deterministic cache hashes with xxh3, added path canonicalization to all file ops (C2), fixed COM apartment leak in create_desktop_shortcut (C5), corrected lock screen registry key typo (C6), handled poisoned mutex recovery (C4), improved ffmpeg fallback error reporting (M11), added destination-exists check to rename_file (M10), reduced PDF integrity check to 5-byte read (M12), waited for winget install to finish (M14), widened monitor bounds for 6K+ (L3), percent-encoded file:// URLs (L6), validated CoInitializeEx HRESULT (L7). Frontend: rewired volume diamond/scroll/slider handlers from noop callback to direct media element manipulation (M2 — volume controls now work), added empty NodeList guards to all 4 diamond hover/drag functions (M9), fixed GIF video suppressing arrow-key navigation (L2), removed volume=0 auto-muting (L12). Removed dead code: Toasts.svelte (195 lines), 5 unused invoke wrappers in tools.ts, 3 dead storage exports, 2 dead context menu actions + handleApplyCrop, findTouchTarget/seekToTimestamp in timeline.ts, duplicate invokeOpenFolder, unused zip dependency from Cargo.toml. Stripped all decorative ASCII section headers (L1). Both pnpm check and cargo check pass with 0 errors, 0 warnings.

## Status
- Volume diamond/scroll/slider controls — fixed (were wired to noop, now set media element directly)
- Display/video cache keys — fixed (use deterministic xxh3 hash across restarts)
- File operations — hardened (path canonicalization + destination-overwrite guard)
- COM cleanup in create_desktop_shortcut — fixed (CoUninitialize now called on all exit paths)
- Lock screen wallpaper — fixed (registry value name typo corrected)
- Window state mutex — fixed (no longer panics on poisoned lock)
- check_media_integrity PDF read — fixed (5 bytes instead of entire file)
- install_ffmpeg — fixed (waits for winget completion)
- GIF navigation — fixed (no longer blocks arrow keys)
- All dead code listed above — removed
- All other modules — working

## Next
Extract createNavigation config into a navigationHelpers factory (largest remaining inline config block, ~55 lines of getter/setter closures).

## Bugs found this session
- Volume diamond clicks, scroll, and slider were silently no-ops (never set volume)
- GIF files opened as video prevented arrow-key navigation (isTimedMedia treated them as seekable)
- Volume=0 auto-muted the media element independently of the mute toggle

## Current commit
fix: resolve cache, security, and logic bugs from code audit

## Architecture update
_Only if a genuinely new module/concern was added this session that has no existing row in ARCHITECTURE.md —
add the minimum rows needed to the module ownership table. Do not rewrite, reformat, or touch anything else._
- None — no new modules added
