import type { ClipBoundary, ClipPair } from "$lib/types";
import { invokeProcessVideoClips } from "$lib/services/mediaTools";
import { saveClipPrefs, loadClipPrefs } from "$lib/services/storage";
import { getParentFolder } from "$lib/services/files";
export function createClips() {
  function addClipBoundary(
    kind: "start" | "end",
    time: number,
    boundaries: ClipBoundary[],
    set: (v: ClipBoundary[]) => void,
  ) {
    const exists = boundaries.some(
      (m) => m.kind === kind && Math.abs(m.time - time) < 0.25,
    );
    if (exists) return;

    const next = [
      ...boundaries,
      {
        id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        time,
        kind,
        title: "",
      },
    ].sort((a, b) => a.time - b.time);

    set(next);
  }

  function removeClipBoundary(
    id: string,
    boundaries: ClipBoundary[],
    set: (v: ClipBoundary[]) => void,
  ) {
    const next = boundaries.filter((b) => b.id !== id);
    set(next);
  }

  function clearBoundaries(set: (v: ClipBoundary[]) => void) {
    set([]);
  }

  function updateBoundaryTitle(
    id: string,
    title: string,
    boundaries: ClipBoundary[],
    set: (v: ClipBoundary[]) => void,
  ) {
    const next = boundaries.map((marker) =>
      marker.id === id ? { ...marker, title: title.trim() } : marker,
    );
    set(next);
  }

  function getBoundaryById(
    id: string,
    boundaries: ClipBoundary[],
  ): ClipBoundary | undefined {
    return boundaries.find((marker) => marker.id === id);
  }

  function setBoundaryKind(
    id: string,
    kind: "start" | "end",
    boundaries: ClipBoundary[],
    set: (v: ClipBoundary[]) => void,
  ) {
    const next = boundaries
      .map((m) => (m.id === id ? { ...m, kind } : m))
      .sort((a, b) => a.time - b.time);
    set(next);
  }

  function findTouchTarget(
    boundaries: ClipBoundary[],
    time: number,
    tolerance = 0.6,
  ): ClipBoundary | null {
    let found: ClipBoundary | null = null;
    let best = Number.POSITIVE_INFINITY;
    for (const marker of boundaries) {
      const d = Math.abs(marker.time - time);
      if (d <= tolerance && d < best) {
        found = marker;
        best = d;
      }
    }
    return found;
  }

  function computePairs(boundaries: ClipBoundary[]): ClipPair[] {
    const sorted = [...boundaries].sort((a, b) => a.time - b.time);
    const pendingStarts: ClipBoundary[] = [];
    const pairs: ClipPair[] = [];

    for (const marker of sorted) {
      if (marker.kind === "start") {
        pendingStarts.push(marker);
      } else if (pendingStarts.length > 0) {
        const start = pendingStarts.shift()!;
        if (marker.time > start.time) {
          pairs.push({
            start: start.time,
            end: marker.time,
            startId: start.id,
            endId: marker.id,
          });
        }
      }
    }

    return pairs.sort((a, b) => a.start - b.start);
  }

  return {
    addClipBoundary,
    removeClipBoundary,
    clearBoundaries,
    updateBoundaryTitle,
    getBoundaryById,
    setBoundaryKind,
    findTouchTarget,
    computePairs,
  };
}

export class ClipExporter {
  outputDir = $state("");
  deleteOriginal = $state(false);
  useCustomPath = $state(false);
  mergeSegments = $state(false);
  jobRunning = $state(false);
  jobLabel = $state("");
  deleteConfirm: { visible: boolean; mode: "separate" | "merge" | null } = $state({
    visible: false,
    mode: null,
  });
  toast: { visible: boolean; tone: "success" | "error"; message: string; outputDir: string } = $state({
    visible: false, tone: "success", message: "", outputDir: ""
  });
  
  toastTimer: ReturnType<typeof setTimeout> | undefined;

  loadPrefs() {
    const prefs = loadClipPrefs();
    this.outputDir = prefs.outputDir;
    this.deleteOriginal = prefs.deleteOriginal;
    this.useCustomPath = prefs.useCustomPath;
    this.mergeSegments = prefs.mergeSegments;
  }

  persistPrefs() {
    saveClipPrefs({
      deleteOriginal: this.deleteOriginal,
      useCustomPath: this.useCustomPath,
      mergeSegments: this.mergeSegments,
    });
  }

  getTargetDir(filePath: string): string {
    return this.useCustomPath ? this.outputDir || getParentFolder(filePath) : getParentFolder(filePath);
  }

  showToast(message: string, tone: "success" | "error", dir: string) {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, tone, message, outputDir: dir };
    this.toastTimer = setTimeout(() => {
      this.toast.visible = false;
    }, 4200);
  }

  extractInvokeErrorMessage(e: unknown): string {
    if (e instanceof Error && e.message) return e.message;
    if (typeof e === "string" && e.trim()) return e;
    if (e && typeof e === "object") {
      const msg = (e as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
    }
    return "Failed to create clips.";
  }

  async runAction(
    mode: "separate" | "merge",
    filePath: string,
    isVideo: boolean,
    clipCount: number,
    clipPairs: { start: number; end: number }[],
    onClearBoundaries: () => void,
    onDeletedOriginal: (path: string) => void,
    onDisplayFile: (path: string) => Promise<void>
  ) {
    if (!isVideo || clipCount === 0 || this.jobRunning) return;
    this.jobRunning = true;
    this.jobLabel = mode === "separate" ? "Separating clips..." : "Merging clips...";
    try {
      const result = await invokeProcessVideoClips(
        filePath,
        this.getTargetDir(filePath),
        clipPairs,
        mode,
        this.deleteOriginal,
      );
      const count = result.outputs.length;
      const noun = count === 1 ? "clip" : "clips";
      const msg = `${count} ${noun} created${result.deleted_original ? " and original file deleted" : ""}.`;
      this.showToast(msg, "success", result.output_dir || this.outputDir || getParentFolder(filePath));
      
      onClearBoundaries();
      if (result.deleted_original) {
        onDeletedOriginal(filePath);
      } else {
        await onDisplayFile(filePath);
      }
    } catch (e) {
      const msg = this.extractInvokeErrorMessage(e);
      this.showToast(msg, "error", "");
    } finally {
      this.jobRunning = false;
      this.jobLabel = "";
      this.deleteConfirm = { visible: false, mode: null };
    }
  }

  requestAction(
    mode: "separate" | "merge",
    filePath: string,
    isVideo: boolean,
    clipCount: number,
    clipPairs: { start: number; end: number }[],
    onClearBoundaries: () => void,
    onDeletedOriginal: (path: string) => void,
    onDisplayFile: (path: string) => Promise<void>
  ) {
    if (this.deleteOriginal) {
      this.deleteConfirm = { visible: true, mode };
      return;
    }
    this.runAction(mode, filePath, isVideo, clipCount, clipPairs, onClearBoundaries, onDeletedOriginal, onDisplayFile);
  }

  triggerSegments(
    filePath: string,
    isVideo: boolean,
    clipCount: number,
    clipPairs: { start: number; end: number }[],
    onClearBoundaries: () => void,
    onDeletedOriginal: (path: string) => void,
    onDisplayFile: (path: string) => Promise<void>
  ) {
    this.requestAction(this.mergeSegments ? "merge" : "separate", filePath, isVideo, clipCount, clipPairs, onClearBoundaries, onDeletedOriginal, onDisplayFile);
  }
}
