# Blueprint

Frontend: `src/` — Svelte 5 runes, single-page app, no SSR, no routes beyond `+page.svelte`.  
Backend: `src-tauri/src/commands/` — one module per domain. Shared helpers in `util.rs` and `window_state.rs`, types in `types.rs`, constants in `constants.rs`. `lib.rs` is only `run()` + `setup()`.

## Module ownership

Find the closest existing module before creating anything new.

| Concern                                         | Module                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Open/close, navigate, display state             | `features/media/media.svelte.ts`                                                                         |
| Zoom, pan, fit, fullscreen                      | `features/viewer/viewer.svelte.ts`                                                                       |
| Media view components (image, video, PDF)       | `features/viewer/ImageView.svelte`, `features/viewer/VideoView.svelte`, `features/viewer/PDFView.svelte` |
| Rotation, flip, brightness, crop, export        | `features/editing/editing.svelte.ts`                                                                     |
| Video play/pause, volume, speed, scrub          | `features/media/playback.svelte.ts`                                                                      |
| Clip boundaries, in/out points, jobs            | `features/media/clips.svelte.ts`                                                                         |
| Slideshow timer, order, transitions             | `features/media/slideshow.svelte.ts`                                                                     |
| Markers, timestamps, AB loop, resume            | `features/markers/*`                                                                                     |
| PDF rendering                                   | `features/pdf/pdf.svelte.ts`                                                                             |
| Drawing / markup strokes                        | `features/markup/markup.svelte.ts`                                                                       |
| Theme                                           | `features/theme/theme.svelte.ts`                                                                         |
| Font / typography                               | `features/font/font.svelte.ts`                                                                           |
| Filesystem scans, folder cache                  | `services/files.ts`                                                                                      |
| localStorage read/write                         | `services/storage.ts`                                                                                    |
| Clipboard copy/paste                            | `services/clipboard.ts`                                                                                  |
| Window/dialog ephemera                          | `services/session.ts`                                                                                    |
| Tauri invoke wrappers, FFmpeg orchestration     | `features/media/tools.ts`, `features/media/ffmpeg.ts`, `features/media/sources.ts`                       |
| Extension lists, loop modes, time constants     | `shared/constants.ts`                                                                                    |
| Domain types (`VideoMarker`, `ClipBoundary`, …) | `shared/types.ts`                                                                                        |
| Keybinds dispatch                               | `shared/keybinds.ts`                                                                                     |
| Library view (grid, thumbnail demand queue)     | `features/library/library.svelte.ts`, `features/library/LibraryView.svelte`                              |
| Toast system (store + component)                | `features/toast/toast.svelte.ts`, `shared/Toast.svelte`                                                  |
| Media-kind detection                            | `shared/media-kind.ts`                                                                                   |
| Generic primitives (Shell, Tooltip, Marquee)    | `shared/*.svelte`                                                                                        |
| Dialogs (settings, about, help, feedback, …)    | `features/dialogs/*`                                                                                     |
| Dialog/menu state (visibility, context menus)   | `features/stores/*`                                                                                      |
| Context actions, properties, global mouse       | `features/actions/*`                                                                                     |
| Edit apply/export orchestration, dialogs        | `features/edit-dialogs/editActions.svelte.ts`                                                            |
| Window state save/restore                       | `window_state.rs`                                                                                        |
| File metadata formatting                        | `shared/file-meta.ts`                                                                                    |
| Menus (edit, process, slideshow, …)             | `features/menus/*`                                                                                       |
| Timeline (markers, scrubber)                    | `features/timeline/*`                                                                                    |
| Navigation (thumbnail bar, sort menu)           | `features/navigation/*`                                                                                  |

## State pattern

Runes modules export a singleton (`export const x = createX()`) for app-scoped state, or a factory (`export function createX()`) when multiple instances are needed.

`+page.svelte` reads from these modules and binds DOM refs into them. It owns no state, no business logic, no handlers. Anything you'd add there belongs in a feature module instead.

Video/audio elements live in `+page.svelte`'s template (they're DOM nodes), but their state is mirrored into the relevant module via `mediaElRef` callback or `bind:this` setter.

## Inter-module communication

Modules communicate by **direct import**, not events or a global bus.

- Feature modules import from `shared/` (types, constants, helpers) and `services/` (storage, files, clipboard).
- Feature modules may import from other feature modules when there's a clear dependency (e.g. `playback` importing from `media`). Circular imports are a sign the boundary is wrong — resolve by extracting shared state to `shared/` or `services/`.
- `+page.svelte` imports from feature modules, never the reverse.
- Components import from their feature module. They do not import from sibling feature modules directly — route that through the parent feature module or a shared service.
- Tauri commands are called through wrappers in `tools.ts`, `ffmpeg.ts`, or `sources.ts`. No raw `invoke()` calls outside those files.

## Storage

`localStorage` with `vyu-` prefix. Per-file keys: `vyu-{kind}-{path}`. App-wide keys: `vyu-{name}`. All reads and writes go through `services/storage.ts`. `cleanupStaleStorageEntries()` caps per-file groups at 500 entries on startup.

Full key map lives in `services/storage.ts` — keep it there, not scattered across feature modules.

## File watching

`watchImmediate()` from `@tauri-apps/plugin-fs` with 300ms debounce. On fire: rescan folder, re-sort, adjust current index if the open file moved or was deleted.

## Known constraints

These are non-obvious decisions that have already been made and must not be reversed without explicit discussion:

| Constraint                                                | Reason                                                                                                                                                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Thumbnail cache uses `$state<Record>`, not `Map`          | `LibraryView` accesses via bracket notation (`cache[path]`), which Svelte's proxy tracks. `Map.set()` is opaque to the proxy — switching to `Map` silently breaks all thumbnail loading. |
| `pdfjs-dist` is a dynamic import                          | Only loaded when a PDF opens. Keeps initial bundle small.                                                                                                                                |
| `stat()` under sort is capped at 8 concurrent workers     | Uncapped `stat()` calls caused contention on large folders.                                                                                                                              |
| Temp dirs are hash-based subdirs under `%TEMP%/Vyu-temp/` | Concurrent conversion ops were deleting each other's temp files when sharing a flat dir.                                                                                                 |
| Cross-volume rename uses copy+delete fallback             | `rename_file()` fails silently across mount points (`ERROR_NOT_SAME_DEVICE`). The fallback is intentional.                                                                               |
