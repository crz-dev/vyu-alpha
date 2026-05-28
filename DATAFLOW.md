# Vyu Data Flows

## Flow 1 — File Open (Dialog / Drag & Drop)

### 1.1 Entry point

User triggers `openFileDialog()` in `+page.svelte`. This calls `open()` from `@tauri-apps/plugin-dialog` with a filter for all media extensions. On selection, the returned path is passed to `loadFile(path)`.

Drag-and-drop uses `handleFileDrop()` in `+page.svelte`, which extracts the file path from the drop event and calls `loadFile(path)` directly.

### 1.2 Loading state

`+page.svelte → loadFile(path)`:

1. Stops any running slideshow
2. Disables crop mode (`viewer.state.cropMode = false`)
3. Calls `media.loadFile(path, setMediaState, setFileList)`
4. Calls `viewer.setCurrentFile(path)` to restore saved crop bounds for this path

`setMediaState` is a dispatch closure that patches local `$state` variables. `setFileList` is an inline callback that sets `fileList` and `currentIndex`.

### 1.3 File metadata

`features/media/media.svelte.ts → loadFile()`:

1. Sets `{ isLoadingFile: true }`
2. Delegates to `displayFile(path, set)`

`features/media/media.svelte.ts → displayFile()`:

1. Calls `releaseMediaResources()` to unload any previous media
2. Determines `isVideo` by checking extension against `VIDEO_EXTS`
3. Resets all display state via `set()`:
   - `filePath`, `fileName`, `isVideo`, `fileSrc` (empty initially), `fileInfoLoading: true`
   - `timestamps: isVideo ? readTimestamps(path) : []` → `services/storage.ts`
   - `clipBoundaries: isVideo ? readClipBoundaries(path) : []` → `services/storage.ts`
   - `resumePoint: isVideo ? loadResumePoint(path) : null` → `services/storage.ts`
4. Calls `onReset()` (viewer state reset from `+page.svelte`)
5. Waits one animation frame then sets `fileSrc = convertFileSrc(path)` (Tauri asset URL)
6. Calls `stat(path)` from `@tauri-apps/plugin-fs` (cached in `statCache`) to populate `fileSize`, `fileCreated`, `fileModified`

### 1.4 Folder scanning (building the file list)

Back in `loadFile()`:

```ts
const list = await readMediaFilesInFolder(path);
setFileList(list, list.indexOf(path));
```

`services/files.ts → readMediaFilesInFolder(path)`:

1. Extracts the parent directory from the path
2. Checks an LRU cache (max 50 folders)
3. Calls `readDir(folder)` from `@tauri-apps/plugin-fs`
4. Filters entries by `ALL_EXTS` (image + video extensions)
5. Sorts alphabetically, returns full paths
6. Caches the result, evicts oldest if over 50

The file list enables arrow-key navigation. This scan only happens on initial file open, **not** on subsequent navigation within the same folder.

### 1.5 Viewer update — image

When `fileSrc` changes, the `<img>` element in `+page.svelte` loads the new source. `onload={onImageLoad}` fires:

1. `media.onImageLoad()` in `media.svelte.ts` sets `imageNaturalWidth`, `imageNaturalHeight`, `fileDimensions`
2. `+page.svelte` calls `viewer.fitToScreen()` to compute `baseZoomLevel` and `zoomLevel` based on container dimensions
3. The `imageStyle` derived value recomputes a CSS transform string applying scale, translate, rotation, flip, color filters, and crop clip-path

### 1.6 Viewer update — video

When `fileSrc` changes, the `<video>` element in `+page.svelte` loads the new source. `onloadedmetadata={onVideoLoad}` fires:

1. `media.onVideoLoad()` in `media.svelte.ts` applies volume/mute/loop settings to the video element, sets `fileDimensions`, `rawDurationSecs`, `playing`
2. `ontimeupdate={updateProgress}` fires on each frame → `playback.updateProgress()` in `playback.svelte.ts` updates `rawCurrentSecs`, `progress`, `playing`
3. `videoWrapperTransform` and `videoInnerStyle` derived values recompute the transform CSS strings

### 1.7 LocalStorage restore

On every `displayFile()` call, three localStorage keys are read (video-only):

| Key                 | Read by                                | Stored data           |
| ------------------- | -------------------------------------- | --------------------- |
| `vyu-ts-{path}`     | `readTimestamps()` in `storage.ts`     | `Timestamp[]` JSON    |
| `vyu-clips-{path}`  | `readClipBoundaries()` in `storage.ts` | `ClipBoundary[]` JSON |
| `vyu-resume-{path}` | `loadResumePoint()` in `storage.ts`    | `number` (seconds)    |

---

## Flow 2 — File Navigation (Arrow Keys)

### 2.1 Keybind dispatch

`shared/keybinds.ts → setupKeybinds(actions)` returns a `handleKeydown` closure. Registered in `+page.svelte` as a `window.keydown` listener.

**When not hovering video / not fullscreen:**

- `ArrowRight` → `actions.navigate(1)`
- `ArrowLeft` → `actions.navigate(-1)`
- `Space` → `actions.togglePlay()` (video only)

**When hovering video:**

- `ArrowRight` → seek +5s in video (not navigation)
- `ArrowLeft` → seek -5s in video

**Override — always navigates regardless of hover:**

- `Alt+ArrowRight` → `actions.navigate(1)`
- `Alt+ArrowLeft` → `actions.navigate(-1)`
- `Ctrl+ArrowRight` → `actions.navigateToEdge(false)` (last file)
- `Ctrl+ArrowLeft` → `actions.navigateToEdge(true)` (first file)

### 2.2 Navigation handler

`+page.svelte → navigate(direction)`:

```ts
slideshow.stop();
viewer.state.cropMode = false;
const next = (currentIndex + direction + fileList.length) % fileList.length;
viewer.setCurrentFile(fileList[next]);
currentIndex = media.navigate(direction, fileList, currentIndex, setMediaState);
```

### 2.3 Media state transition

`features/media/media.svelte.ts → navigate()`:

- Computes the next index (wrap-around with modulo)
- Calls `displayFile(fileList[next], set)` — same chain as Flow 1 Step 1.3
- **Does NOT call `readMediaFilesInFolder()`** — the file list is unchanged

`navigateToEdge()` jumps to index 0 or `fileList.length - 1` (Ctrl+Arrow).

### 2.4 Slideshow interaction

The slideshow is bound to the page's live state via `slideshow.bind()`:

```ts
slideshow.bind(
  () => fileList,
  () => currentIndex,
  advanceSlide,
  () => videoEl,
);
```

When the slideshow timer fires or a video ends, `advanceSlide(nextIndex)` is called, which calls `media.displayFile()` directly. Manual arrow-key navigation calls `slideshow.stop()` first, pausing the slideshow while the user browses.

Slideshow scheduling (`slideshow.svelte.ts → schedule()`):

- **Images / videos in "skip" mode:** `setTimeout` with `intervalSec * 1000ms`
- **Videos in "full" mode:** attaches `ended` event listener — advances when video finishes
- **Shuffle order:** `buildShuffle()` pre-computes a random index array, then walks through it sequentially

### 2.5 LocalStorage flow (timestamps, clips, resume)

**On every navigation** (via `displayFile`):

- `readTimestamps(path)` → parses `vyu-ts-{path}` from localStorage
- `readClipBoundaries(path)` → parses `vyu-clips-{path}`
- `loadResumePoint(path)` → parses `vyu-resume-{path}`

**On state mutation:**

- Timestamp add/remove/edit → `saveTimestamps()` → `writeTimestamps()` in `storage.ts`
- Clip boundary add/remove/edit → 300ms debounced auto-save in `clips.svelte.ts` → `writeClipBoundaries()` in `storage.ts`
- Resume point → `window.beforeunload` handler → `saveResumePoint()` in `storage.ts` (unless within 1.5s of video end, in which case it erases)

**On app start** (`onMount`):

- `cleanupStaleStorageEntries()` caps timestamp/clip/resume entries at 500 each
- `loadVolume()`, `loadLoopMode()`, `loadSliderMode()`, `loadClipPrefs()` restore user preferences

---

## Video Element Lifecycle

The `<video>` element is declared, bound, and shared entirely in `+page.svelte`:

1. **Declaration:** `let videoEl = $state<HTMLVideoElement | null>(null)`
2. **Binding:** `<video bind:this={videoEl} ...>`
3. **Sharing with viewer:** `viewer.setVideoEl(videoEl)` — enables `getVideoWrapperTransform()` / `getVideoInnerTransform()` to read video dimensions
4. **Sharing with playback:** `playback = createPlaybackActions(() => videoEl)` — `videoElRef` callback gives playback lazy access for play/pause/volume/progress
5. **Sharing with slideshow:** `slideshow.bind(..., () => videoEl)` — enables `ended` event listening in "full" video mode
6. **Events on the element:**
   - `ontimeupdate` → `playback.updateProgress()` → `rawCurrentSecs`, `progress`, `playing`
   - `onloadedmetadata` → `media.onVideoLoad()` → volume/mute/loop, dimensions, duration
   - `onended` → handles loop/stop/next/shuffle via `loopMode`

---

## LocalStorage Map

| Key                        | R/W   | Storage function                                                   | Trigger                                 |
| -------------------------- | ----- | ------------------------------------------------------------------ | --------------------------------------- |
| `vyu-volume`               | R/W   | `loadVolume`, `saveVolume`                                         | App start / volume change               |
| `vyu-delete-no-ask`        | R/W   | `loadDeleteNoAsk`, `saveDeleteNoAsk`                               | Delete confirm dialog                   |
| `vyu-loop-mode`            | R/W   | `loadLoopMode`, `saveLoopMode`                                     | App start / loop toggle                 |
| `vyu-slider-mode`          | R/W   | `loadSliderMode`, `saveSliderMode`                                 | App start / slider toggle               |
| `vyu-clip-delete-original` | R/W   | `loadClipPrefs`, `saveClipPrefs`                                   | App start / clip pref change            |
| `vyu-clip-use-custom-path` | R/W   | `loadClipPrefs`, `saveClipPrefs`                                   | App start / clip pref change            |
| `vyu-clip-merge-segments`  | R/W   | `loadClipPrefs`, `saveClipPrefs`                                   | App start / clip pref change            |
| `vyu-clip-output-dir`      | R/W   | `loadClipPrefs`, `saveClipPrefs`                                   | App start / path selection              |
| `vyu-ts-{path}`            | R/W/E | `readTimestamps`, `writeTimestamps`, `eraseTimestamps`             | File load / timestamp edit              |
| `vyu-clips-{path}`         | R/W/E | `readClipBoundaries`, `writeClipBoundaries`, `eraseClipBoundaries` | File load / clip edit (debounced 300ms) |
| `vyu-resume-{path}`        | R/W/E | `loadResumePoint`, `saveResumePoint`, `eraseResumePoint`           | File load / beforeunload                |
| `vyu-sort-mode`            | R/W   | `loadSortMode`, `saveSortMode`                                     | App start / sort change                 |
| `vyu-sort-desc`            | R/W   | `loadSortDesc`, `saveSortDesc`                                     | App start / sort direction change       |

Stale cleanup: `cleanupStaleStorageEntries()` caps each prefix group at 500 entries on app start.

---

## Flow 5 — File Watching (Live Folder Sync)

### 5.1 How it works

The app watches the parent directory of the currently open file using `watchImmediate()` from `@tauri-apps/plugin-fs` (which uses the `notify` crate with Windows ReadDirectoryChangesW). When files are added, removed, or renamed in the folder, the app re-scans and updates the file list.

### 5.2 Watch lifecycle

- **Start:** When a file is opened via `loadFile(path)`, `startWatching(folder)` is called. The parent folder is extracted via `getParentFolder(path)`.
- **Events:** `watchImmediate` fires on any filesystem change. A 300ms debounce timer resets on each event.
- **Rescan:** When the debounce fires, `onFolderChanged(folder)` calls `rescanFolder(folder, sortMode, sortDesc)` which clears the LRU cache for that folder and re-reads + re-sorts the directory.
- **Current file handling:**
  - If the current file is still in the new list → update `fileList` and `currentIndex` to its new position
  - If the current file was deleted → advance to the nearest neighbor (`Math.min(prevIndex, newList.length - 1)`)
  - If the folder is now empty → call `closeFile()`
- **Stop:** When a file is closed via `closeFile()`, or when navigating to a new file (which restarts watching for the new folder), `stopWatching()` is called. This clears the debounce timer and invokes the unwatch callback.

### 5.3 Backend setup

- `src-tauri/Cargo.toml`: `tauri-plugin-fs = { version = "2", features = ["watch"] }` enables the `notify` crate backend
- `src-tauri/capabilities/default.json`: `fs:allow-watch` and `fs:allow-unwatch` permissions grant the frontend access

---

## Flow 6 — Sort System

### 6.1 Sort modes

Five global sort modes are available, exposed via a Sort button in the bottom bar (when the thumbnail bar is open):

| Mode          | Sort key                 | Requires stat() |
| ------------- | ------------------------ | --------------- |
| Name          | Filename (locale-aware)  | No              |
| Date modified | `mtime`                  | Yes             |
| Date created  | `birthtime`              | Yes             |
| Size          | File size in bytes       | Yes             |
| Type          | Extension, then filename | No              |

Each mode can be ascending or descending. The default is Name ascending.

### 6.2 Persistence

Sort preferences are stored in localStorage:

| Key             | Values                                                            | Default   |
| --------------- | ----------------------------------------------------------------- | --------- |
| `vyu-sort-mode` | `"name"`, `"date-modified"`, `"date-created"`, `"size"`, `"type"` | `"name"`  |
| `vyu-sort-desc` | `"true"`, `"false"`                                               | `"false"` |

Loaded on app start via `loadSortMode()` and `loadSortDesc()` in `storage.ts`.

### 6.3 Sorting implementation

`services/files.ts → sortFileList(list, mode, desc)`:

- **Name/Type:** Pure string comparison, no filesystem access
- **Date modified/created/size:** Calls `stat()` on every file in the folder via `Promise.all()`. Results are not cached (stat calls are fast on local NTFS).

### 6.4 LRU cache key

The folder cache key includes the sort mode and direction: `folder + "\0" + mode + "\0" + desc`. This means different sort modes get separate cache entries for the same folder. `clearFolderCache(folder)` clears all entries whose key starts with the given folder path.

### 6.5 UI

- **Bottom bar:** A "Sort" button appears to the right of the file count pill when the thumbnail bar is open
- **Fullscreen:** A floating "Sort" pill appears to the right of the file count pill
- Clicking "Sort" opens a small dropdown (`SortMenu.svelte`) with the five sort options (checkmark on active) and an ascending/descending toggle
