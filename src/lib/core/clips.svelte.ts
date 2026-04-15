import type { ClipBoundary, ClipPair } from "$lib/types";

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
    computePairs,
  };
}
