# Vyu — Agent Notes

Tauri 2 + Svelte 5 (runes) + TypeScript + pnpm. Windows desktop media viewer. Replaces Windows Photos. Private by architecture — no telemetry, no internet, files never leave the device.

See `BLUEPRINT.md` for module map, state pattern, and where new code goes.

## Commands

| Task       | Command                   |
| ---------- | ------------------------- |
| Dev        | `pnpm tauri dev`          |
| Build      | `pnpm tauri build`        |
| Type check | `pnpm check`              |
| Format     | `pnpm prettier --write .` |

**Prereqs:** Rust toolchain + FFmpeg on PATH. Not bundled — `install_ffmpeg()` via winget when missing.

## Hard rules

- **State goes in `src/lib/features/*/` only.** `src/routes/+page.svelte` is a layout shell — no state, no handlers, no business logic.
- **New top-level dependencies (npm or cargo) require an explicit reason before adding.**
- **SvelteKit routes stay as-is.** Intentionally a single-page app. Do not add routes.
- **FFmpeg stays external.** Backend shells out to `ffmpeg` on PATH. Do not bundle it.
- **Top-level toolbar icons stay fixed.** Shell bar design is locked.
- **Constants must stay in sync.** `IMAGE_EXTS`, `VIDEO_EXTS`, `AUDIO_EXTS`, `DOCUMENT_EXTS` in `shared/constants.ts` must match `*_RUST` constants in `src-tauri/src/constants.rs`.

## Svelte / TypeScript conventions

- Svelte 5 runes only — `$state`, `$derived`, `$effect`. No legacy `let`/`$:` reactivity.
- `let` for `$state` declarations.
- TypeScript strict mode. `tsconfig.json` extends `.svelte-kit/tsconfig.json`.
- No SSR — `+layout.ts` exports `ssr = false`.
- `localStorage` keys use `vyu-` prefix. Per-file: `vyu-{kind}-{path}`. App-wide: `vyu-{name}`.
- `pdfjs-dist` is dynamically imported — only loads when a PDF opens.
- Vite port 1420, `strictPort: true`. Window decorations disabled — app draws its own title bar.

## Cache paths

| Cache type | Path                                   |
| ---------- | -------------------------------------- |
| Thumbnails | `%LOCALAPPDATA%/vyu/cache/thumbnails/` |
| Display    | `%LOCALAPPDATA%/vyu/cache/displays/`   |
| Temp       | `%TEMP%/Vyu-temp/{unique-hash}/`       |

Temp dirs must be unique per operation (hash-based subdir) — concurrent ops must never share a temp dir.

## Code style

- No decorative ASCII section headers. Folder structure is the section header.
- No `// DATAFLOW:` comments. Module exports are the doc.
- No JSDoc on private helpers. Comments explain _why_, never _what_.
- No defensive null chains re-checking what an earlier guard already covered.
- Early returns over nested if/else.
- `console.error` only for caught-and-swallowed failures. No logging on the happy path.
- Named functions over anonymous arrows in event handlers unless the closure captures something specific.
- No emoji or exclamation points in user-facing strings. Tone is terse.

## Backend (Rust)

Tauri commands live in `src-tauri/src/commands/`, one file per domain. Shared helpers in `util.rs`, types in `types.rs`, constants in `constants.rs`.

Domains: thumbnails, display image prep (TIFF/PSD/JXL/RAW/HEIC → PNG), video remuxing, clip extraction, conversion, compression, crop/edit, integrity check, file ops, window state.

Key constraints:

- Cross-volume file moves must use copy+delete fallback on `ERROR_NOT_SAME_DEVICE`.
- Concurrent operations that write temp files must each get a unique hash-based subdir.
- `stat()` calls under sort operations are capped at 8 concurrent workers.

## Agent behavior

- Reply `Done.` and stop. No follow-up questions unless the task genuinely requires a decision.
- When a design decision is needed, surface it as a specific question with options before proceeding.
- If a skill/command is invoked with no user input, ask what to implement with concrete options.
- No re-checking completed steps. No summarizing unless asked.
- No redundant file reads. No restating context that's already in scope.
- When something is unclear, ask once — precisely — rather than guessing and fixing later.

## Hard rules — repeated for recency

- **State goes in `src/lib/features/*/` only.**
- **New top-level dependencies need an explicit reason before adding.**
- **Constants must stay in sync between `shared/constants.ts` and `constants.rs`.**
