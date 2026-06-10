# Session state
_Overwrite this file completely at end of every session. Never append._
Updated: 2026-06-10

## Last change
Added audio-specific context menu with Effects and Equalizer blue buttons instead of Edit/Markup. Created EffectsMenu.svelte panel with 4 placeholder category buttons (Tune, Style, Stage, Visual). Split `{:else if !isVideo}` branch in Dialog.svelte to handle audio separately. Wired open/close state through menuVisibility store, context actions, Shell layout offsets, and global mouse handler dismiss logic.

## Status
- Audio context menu: working (Copy path, Share, Effects, Equalizer, Show in explorer, Properties, Delete)
- EffectsMenu panel: working (draggable, pinnable, closeable, 4 non-functional placeholder buttons)
- Equalizer button: present, no-op
- Type check: passing

## Next
Text word wrapping / multi-line support.

## Bugs found this session
- None.

## Current commit
feat: add audio context menu with Effects panel

## Architecture update
- `src/lib/features/menus/EffectsMenu.svelte` — new audio effects panel
- `menuVisibility.svelte.ts` — added effectsMenuVisible + open/close
- `contextActions.ts` — added ctxEffects, ctxEqualizer
- `contextActionWrappers.ts` — added wrappers + openEffectsMenu dep
- `Dialog.svelte` — new `{:else if isAudio}` branch in context menu
- `Shell.svelte` — effects menu layout offset + rendering
- `globalMouseHandler.ts` — dismiss logic for effects menu
