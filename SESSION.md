# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-07

## Last change
Replaced all 9 placeholder Debug section rows (logs, FPS toggle, experimental features, software rendering toggle, reinstall FFmpeg) with 7 working debug tools: FFmpeg Status (Check/Reinstall buttons), App Info (copy to clipboard), Thumbnail Cache (clear, shares handler with Library section), Temp Folder (clean), Open Webview DevTools, Toggle Flags (localStorage key viewer), Reset All Settings (two-click confirmation then reload). Added `open_devtools` Rust command to `lib.rs`. Added CSS for debug-status badge, flags list layout, disabled action buttons, and settings-control gap. Removed dead `experimentalFeatures`, `showFpsCounter`, `forceSoftwareRendering` state. Updated section description. Both `pnpm check` and `cargo check` pass with 0 errors, 0 warnings.

## Status
- Debug section — all 7 buttons wired with handlers (working)
- Open DevTools — works in debug builds (Rust command registered)
- Reset All Settings — two-click confirm then reloads (working)
- Toggle Flags viewer — shows all vyu-* localStorage keys inline (working)
- All other modules — untouched, still working

## Next
Extract createNavigation config into a navigationHelpers factory (largest remaining inline config block, ~55 lines of getter/setter closures).

## Bugs found this session
- None.

## Current commit
feat: wire debug section buttons with working handlers

## Architecture update
_Only if a genuinely new module/concern was added this session that has no existing row in ARCHITECTURE.md —
add the minimum rows needed to the module ownership table. Do not rewrite, reformat, or touch anything else._
- None — no new modules added
