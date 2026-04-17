<script lang="ts">
  import type { ClipBoundary, ClipPair, Timestamp, TimestampDragRange } from "$lib/types";

  let {
    fullscreen = false,
    progress,
    isGifVideo,
    clipPairs,
    clipBoundaries,
    timestamps,
    tsDragRange,
    resumePoint,
    clipMarkerJustDragged,
    tsMarkerDragJustEnded,
    tsEditMenuVisible,
    startScrubbing,
    getTimestampPct,
    getDragRangeStyle,
    startClipMarkerDrag,
    removeClipBoundary,
    showClipBoundaryTooltip,
    hideTsTooltip,
    seekToTimestamp,
    openSegmentEditor,
    startTimestampRangeDrag,
    removeTimestamp,
    showTimestampTooltip,
    openTimestampEditor,
    showResumeTooltip,
    hideResumeTooltip,
    seekToResumePoint,
    removeResumePoint,
    formatTime,
  }: {
    fullscreen?: boolean;
    progress: number;
    isGifVideo: boolean;
    clipPairs: ClipPair[];
    clipBoundaries: ClipBoundary[];
    timestamps: Timestamp[];
    tsDragRange: TimestampDragRange;
    resumePoint: number | null;
    clipMarkerJustDragged: boolean;
    tsMarkerDragJustEnded: boolean;
    tsEditMenuVisible: boolean;
    startScrubbing: (e: MouseEvent) => void;
    getTimestampPct: (time: number) => number;
    getDragRangeStyle: () => string;
    startClipMarkerDrag: (e: MouseEvent, id: string) => void;
    removeClipBoundary: (id: string) => void;
    showClipBoundaryTooltip: (e: MouseEvent, marker: ClipBoundary) => void;
    hideTsTooltip: () => void;
    seekToTimestamp: (time: number) => void;
    openSegmentEditor: (e: MouseEvent, id: string) => void;
    startTimestampRangeDrag: (e: MouseEvent, id: string) => void;
    removeTimestamp: (id: string) => void;
    showTimestampTooltip: (e: MouseEvent, ts: Timestamp) => void;
    openTimestampEditor: (e: MouseEvent, id: string) => void;
    showResumeTooltip: (e: MouseEvent) => void;
    hideResumeTooltip: () => void;
    seekToResumePoint: () => void;
    removeResumePoint: () => void;
    formatTime: (time: number) => string;
  } = $props();

  const barClass = $derived(fullscreen ? "fs-progress" : "progress-bar");
  const fillClass = $derived(fullscreen ? "fs-progress-fill" : "progress-fill");
  const playheadClass = $derived(
    fullscreen ? "fs-progress-playhead" : "progress-playhead",
  );
  const clipRangeClass = $derived(fullscreen ? "fs-clip-range" : "clip-range");
  const clipMarkerClass = $derived(
    fullscreen ? "fs-clip-marker" : "clip-marker",
  );
  const clipPairPrefix = $derived(fullscreen ? "fspair" : "pair");
  const clipBarName = $derived(fullscreen ? "fullscreen" : "normal");
</script>

<div
  class={barClass}
  data-clipbar={clipBarName}
  class:hide-for-gif={isGifVideo}
  onmousedown={startScrubbing}
  oncontextmenu={(e) => e.preventDefault()}
  role="slider"
  aria-label="video scrubber"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  tabindex="0"
>
  <div class={fillClass} style="width: {progress}%"></div>
  <div class={playheadClass} style="left: {progress}%"></div>
  {#each clipPairs as pair (`${clipPairPrefix}-${pair.startId}-${pair.endId}`)}
    <div
      class={clipRangeClass}
      style="left: {getTimestampPct(pair.start)}%; width: {getTimestampPct(pair.end) -
        getTimestampPct(pair.start)}%;"
    ></div>
  {/each}
  {#if tsDragRange.visible}
    <div
      class="ts-drag-range"
      class:converting={tsDragRange.phase === "converting"}
      class:fading={tsDragRange.phase === "fading"}
      style={getDragRangeStyle()}
    ></div>
  {/if}
  {#if resumePoint !== null}
    <div
      class="resume-marker"
      style="left: {getTimestampPct(resumePoint)}%"
      role="button"
      tabindex="0"
      onclick={(e) => {
        e.stopPropagation();
        seekToResumePoint();
        removeResumePoint();
      }}
      oncontextmenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        removeResumePoint();
      }}
      onmouseenter={showResumeTooltip}
      onmouseleave={hideResumeTooltip}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          seekToResumePoint();
        }
      }}
      aria-label="Resume at {formatTime(resumePoint)}"
    ></div>
  {/if}
  {#each clipBoundaries as marker (marker.id)}
    <div
      class="{clipMarkerClass} {marker.kind === 'start' ? 'start-marker' : 'end-marker'}"
      style="left: {getTimestampPct(marker.time)}%"
      role="button"
      tabindex="0"
      onmousedown={(e) => startClipMarkerDrag(e, marker.id)}
      oncontextmenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        removeClipBoundary(marker.id);
      }}
      onmouseenter={(e) => showClipBoundaryTooltip(e, marker)}
      onmouseleave={hideTsTooltip}
      onclick={(e) => {
        e.stopPropagation();
        if (clipMarkerJustDragged) return;
        seekToTimestamp(marker.time);
      }}
      ondblclick={(e) => openSegmentEditor(e, marker.id)}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          seekToTimestamp(marker.time);
        }
      }}
      aria-label={marker.title
        ? `${marker.kind} clip marker ${marker.title} at ${formatTime(marker.time)}`
        : `${marker.kind} clip marker at ${formatTime(marker.time)}`}
    ></div>
  {/each}
  {#each timestamps as ts (ts.id)}
    <div
      class="ts-marker"
      style="left: {getTimestampPct(ts.time)}%"
      role="button"
      tabindex="0"
      onmousedown={(e) => startTimestampRangeDrag(e, ts.id)}
      onclick={(e) => {
        e.stopPropagation();
        if (tsMarkerDragJustEnded) return;
        seekToTimestamp(ts.time);
      }}
      ondblclick={(e) => openTimestampEditor(e, ts.id)}
      onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          seekToTimestamp(ts.time);
        }
      }}
      oncontextmenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        removeTimestamp(ts.id);
      }}
      onmouseenter={(e) => showTimestampTooltip(e, ts)}
      onmouseleave={() => {
        if (!tsEditMenuVisible) hideTsTooltip();
      }}
      aria-label="timestamp {ts.title
        ? `${ts.title} at ${formatTime(ts.time)}`
        : formatTime(ts.time)}"
    ></div>
  {/each}
</div>
