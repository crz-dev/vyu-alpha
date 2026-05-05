<script lang="ts">
  import type {
    Timestamp,
    ClipBoundary,
    TimestampDragRange,
  } from "$lib/shared/types";
  import type { LoopMode } from "$lib/shared/constants";
  import { viewer } from "$lib/features/viewer/viewer.svelte";
  import TimelineMarkers from "$lib/features/timeline/TimelineMarkers.svelte";
  import PlaybackControls from "$lib/features/media/PlaybackControls.svelte";

  let {
    isVideo,
    videoEl,
    isGifVideo,
    fileList,
    currentIndex,
    fileName,
    progress,
    rawCurrentSecs,
    playing,
    muted,
    volume,
    loopMode,
    VOLUME_SEGMENTS,
    timestamps,
    resumePoint,
    tsDragRange,
    clips,
    playbackUI,
    tsEditMenu,
    volumeSliderMode,
    speedSliderMode,
    tsMenuOpen = $bindable(false),
    togglePlay,
    cycleLoopMode,
    toggleMute,
    setVolume,
    addTimestamp,
    addClipBoundary,
    addClipBoundaryAt,
    clearAllTimestamps,
    clearAllSegments,
    toggleTimer,
    currentTimeDisplay,
    durationDisplay,
    timerTooltip,
    toggleFullscreen,
    toggleVolumeSliderMode,
    toggleSpeedSliderMode,
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
    tsMarkerDragJustEnded,
    navigate,
    startPan,
    handleViewerScroll,
    fsCursor,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
    toggleThumbnailBar,
  }: {
    isVideo: boolean;
    videoEl: HTMLVideoElement | null;
    isGifVideo: boolean;
    fileList: string[];
    currentIndex: number;
    fileName: string;
    progress: number;
    rawCurrentSecs: number;
    playing: boolean;
    muted: boolean;
    volume: number;
    loopMode: LoopMode;
    VOLUME_SEGMENTS: number;
    timestamps: Timestamp[];
    resumePoint: number | null;
    tsDragRange: TimestampDragRange;
    clips: {
      clipBoundaries: ClipBoundary[];
      clipPairs: { start: number; end: number; startId: string; endId: string }[];
      clipCount: number;
      clipMarkerJustDragged: boolean;
    };
    playbackUI: {
      volumeHovered: boolean;
      speedHovered: boolean;
      playbackSpeed: number;
      volumeTooltipX: number;
      volumeTooltipY: number;
      volumeTooltipVisible: boolean;
      speedTooltipX: number;
      speedTooltipY: number;
      speedTooltipVisible: boolean;
      volumeSliderMode: boolean;
      speedSliderMode: boolean;
      volumeSliderValue: number;
      speedSliderValue: number;
      showVolumeOverlay: () => void;
      handleVolumeAreaLeave: () => void;
      handleVolumeDiamondHover: (e: MouseEvent) => void;
      startVolumeDrag: (e: MouseEvent) => void;
      handleVolumeScroll: (e: WheelEvent) => void;
      setPlaybackSpeed: (val: number) => void;
      showSpeedOverlay: () => void;
      handleSpeedAreaLeave: () => void;
      handleSpeedDiamondHover: (e: MouseEvent) => void;
      startSpeedDrag: (e: MouseEvent) => void;
      handleSpeedScroll: (e: WheelEvent) => void;
      toggleVolumeSliderMode: () => void;
      toggleSpeedSliderMode: () => void;
      startVolumeSliderDrag: (e: PointerEvent, track: HTMLDivElement) => void;
      startSpeedSliderDrag: (e: PointerEvent, track: HTMLDivElement) => void;
      handleVolumeSliderChange: (val: number) => void;
      handleSpeedSliderChange: (val: number) => void;
    };
    tsEditMenu: {
      visible: boolean;
      x: number;
      y: number;
      targetId: string;
      targetType: "timestamp" | "segment";
    };
    volumeSliderMode: boolean;
    speedSliderMode: boolean;
    tsMenuOpen: boolean;
    togglePlay: () => void;
    cycleLoopMode: () => void;
    toggleMute: () => void;
    setVolume: (v: number) => void;
    addTimestamp: () => void;
    addClipBoundary: (kind: "start" | "end") => void;
    addClipBoundaryAt: (kind: "start" | "end", time: number) => void;
    clearAllTimestamps: () => void;
    clearAllSegments: () => void;
    toggleTimer: () => void;
    currentTimeDisplay: () => string;
    durationDisplay: string;
    timerTooltip: string;
    toggleFullscreen: () => void;
    toggleVolumeSliderMode: () => void;
    toggleSpeedSliderMode: () => void;
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
    tsMarkerDragJustEnded: boolean;
    navigate: (dir: number) => void;
    startPan: (e: MouseEvent) => void;
    handleViewerScroll: (e: WheelEvent) => void;
    fsCursor: string;
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
    toggleThumbnailBar: () => void;
  } = $props();
</script>

{#if viewer.state.isFullscreen}
  <div
    class="fs-overlay"
    class:visible={viewer.state.fsControlsVisible || tsEditMenu.visible}
    role="button"
    tabindex="0"
    onwheel={handleViewerScroll}
    onmousedown={startPan}
    ontouchstart={(e) => {
      if (e.touches.length === 2) e.preventDefault();
    }}
    ontouchmove={viewer.handleTouchZoom}
    ontouchend={viewer.handleTouchEnd}
    style="cursor: {fsCursor}"
  >
    <div class="fs-topbar">
      <span class="fs-filename">{fileName}</span>
      <div class="fs-window-controls">
        <button
          class="fs-wc-btn"
          onclick={minimizeWindow}
          aria-label="minimize">−</button
        >
        <button
          class="fs-wc-btn"
          onclick={maximizeWindow}
          aria-label="maximize">▢</button
        >
        <button
          class="fs-wc-btn close"
          onclick={closeWindow}
          aria-label="close">✕</button
        >
      </div>
    </div>
    <div class="fs-nav-left">
      <button
        class="fs-nav-btn"
        onclick={() => navigate(-1)}
        aria-label="previous file">‹</button
      >
    </div>
    <div class="fs-nav-right">
      <button
        class="fs-nav-btn"
        onclick={() => navigate(1)}
        aria-label="next file">›</button
      >
    </div>

    {#if isVideo && videoEl}
      <div class="fs-controls" class:gif-only={isGifVideo}>
        <TimelineMarkers
          fullscreen={true}
          {progress}
          currentTimeSecs={rawCurrentSecs}
          {isGifVideo}
          clipPairs={clips.clipPairs}
          clipBoundaries={clips.clipBoundaries}
          {timestamps}
          {tsDragRange}
          {resumePoint}
          clipMarkerJustDragged={clips.clipMarkerJustDragged}
          {tsMarkerDragJustEnded}
          tsEditMenuVisible={tsEditMenu.visible}
          {startScrubbing}
          {getTimestampPct}
          {getDragRangeStyle}
          {startClipMarkerDrag}
          {removeClipBoundary}
          {showClipBoundaryTooltip}
          {hideTsTooltip}
          {seekToTimestamp}
          {openSegmentEditor}
          {startTimestampRangeDrag}
          {removeTimestamp}
          {showTimestampTooltip}
          {openTimestampEditor}
          {showResumeTooltip}
          {hideResumeTooltip}
          {seekToResumePoint}
          {removeResumePoint}
          {formatTime}
        />
        <PlaybackControls
          fullscreen={true}
          {isGifVideo}
          {playing}
          looping={loopMode}
          {muted}
          {volume}
          volumeHovered={playbackUI.volumeHovered}
          volumeSegments={VOLUME_SEGMENTS}
          {togglePlay}
          toggleLoop={cycleLoopMode}
          {toggleMute}
          showVolumeOverlay={playbackUI.showVolumeOverlay}
          handleVolumeAreaLeave={playbackUI.handleVolumeAreaLeave}
          handleVolumeScroll={playbackUI.handleVolumeScroll}
          startVolumeDrag={playbackUI.startVolumeDrag}
          handleVolumeDiamondHover={playbackUI.handleVolumeDiamondHover}
          {setVolume}
          playbackSpeed={playbackUI.playbackSpeed}
          speedHovered={playbackUI.speedHovered}
          setPlaybackSpeed={playbackUI.setPlaybackSpeed}
          showSpeedOverlay={playbackUI.showSpeedOverlay}
          handleSpeedAreaLeave={playbackUI.handleSpeedAreaLeave}
          handleSpeedScroll={playbackUI.handleSpeedScroll}
          speedTooltipVisible={playbackUI.speedTooltipVisible}
          speedTooltipX={playbackUI.speedTooltipX}
          speedTooltipY={playbackUI.speedTooltipY}
          handleSpeedDiamondHover={playbackUI.handleSpeedDiamondHover}
          startSpeedDrag={playbackUI.startSpeedDrag}
          {addTimestamp}
          addClipStart={() => addClipBoundary("start")}
          addClipEnd={() => addClipBoundary("end")}
          addClipEnd5s={() => addClipBoundaryAt("end", rawCurrentSecs + 5)}
          hasMarkers={timestamps.length > 0 ||
            clips.clipBoundaries.length > 0}
          deleteAllMarkers={() => {
            clearAllTimestamps();
            clearAllSegments();
          }}
          {toggleTimer}
          {currentTimeDisplay}
          {durationDisplay}
          {timerTooltip}
          {toggleFullscreen}
          onTsMenuChange={(v: boolean) => (tsMenuOpen = v)}
          volumeSliderMode={playbackUI.volumeSliderMode || volumeSliderMode}
          speedSliderMode={playbackUI.speedSliderMode || speedSliderMode}
          volumeSliderValue={playbackUI.volumeSliderValue}
          speedSliderValue={playbackUI.speedSliderValue}
          {toggleVolumeSliderMode}
          {toggleSpeedSliderMode}
          startVolumeSliderDrag={playbackUI.startVolumeSliderDrag}
          startSpeedSliderDrag={playbackUI.startSpeedSliderDrag}
          handleVolumeSliderChange={setVolume}
          handleSpeedSliderChange={playbackUI.handleSpeedSliderChange}
        />
      </div>
    {:else}
      <div class="fs-controls image-only">
        <div class="fs-controls-row">
          <span class="fs-time"
            >{fileList.length > 0
              ? `${currentIndex + 1} / ${fileList.length}`
              : ""}</span
          >
          <div class="fs-right">
            <button
              class="fs-ctrl-btn"
              onclick={viewer.toggleFullscreen}
              aria-label="exit fullscreen"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                ><path
                  d="M4 1H1V4M8 1H11V4M11 8V11H8M4 11H1V8"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                /></svg
              >
            </button>
          </div>
        </div>
      </div>
    {/if}
  </div>
  {#if fileList.length > 0}
    <button class="fs-file-count-pill" onclick={toggleThumbnailBar}>
      {currentIndex + 1} / {fileList.length}
    </button>
  {/if}
{/if}
