<script lang="ts">
  import { fly } from "svelte/transition";
  import SlideshowMenu from "./slideshowMenu.svelte";

  let dismissed = $state(false);

  let {
    fileListLength,
    currentIndex,
    fileDimensions,
    fileSize,
    fileInfoLoading,
    fileName,
    fileSrc,
    zoomLevel,
    resetZoom,
    toggleFullscreen,
    isVideo,
    clipCount,
    triggerClipSegments,
    clipJobRunning,
    clipDeleteOriginal,
    clipUseCustomPath,
    clipMergeSegments,
    getClipTargetDir,
    toggleClipDeleteOriginal,
    toggleClipPathSelection,
    toggleClipMergeSegments,
    clipJobLabel,
    toggleSlideshowMenu,
    slideshowMenuVisible,
    closeSlideshowMenu,
  }: {
    fileListLength: number;
    currentIndex: number;
    fileDimensions: string;
    fileSize: string;
    fileInfoLoading: boolean;
    fileName: string;
    fileSrc: string;
    zoomLevel: number;
    resetZoom: () => void;
    toggleFullscreen: () => void;
    isVideo: boolean;
    clipCount: number;
    triggerClipSegments: () => void;
    clipJobRunning: boolean;
    clipDeleteOriginal: boolean;
    clipUseCustomPath: boolean;
    clipMergeSegments: boolean;
    getClipTargetDir: () => string;
    toggleClipDeleteOriginal: () => void;
    toggleClipPathSelection: () => void;
    toggleClipMergeSegments: () => void;
    clipJobLabel: string;
    toggleSlideshowMenu: () => void;
    slideshowMenuVisible: boolean;
    closeSlideshowMenu: () => void;
  } = $props();

  $effect(() => {
    if (clipCount > 0) dismissed = false;
  });
</script>

<div class="bottombar">
  <div class="bottombar-left">
    <button
      class="slideshow-btn tooltip-above-shift-right"
      data-tooltip="Miniplayer"
      onclick={() => { /* TODO: miniplayer toggle */ }}
      aria-label="toggle miniplayer"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        stroke-width="0.6"
        stroke-linecap="round"
      >
        <path d="M1 4H4V1M8 1V4H11M11 8H8V11M4 11V8H1" />
      </svg>
    </button>
    <div class="slideshow-anchor">
      <button
        class="file-count tooltip-above-shift-right"
        data-tooltip="Slideshow"
        onclick={toggleSlideshowMenu}
        aria-label="toggle slideshow menu"
      >
        {fileListLength > 0
          ? `${currentIndex + 1} / ${fileListLength}`
          : "—"}
      </button>
      <SlideshowMenu
        visible={slideshowMenuVisible}
        onClose={closeSlideshowMenu}
      />
    </div>
  </div>
  <span class="file-info tooltip-above" data-tooltip="Resolution · File size">
    {#if fileDimensions && fileSize}
      {fileDimensions} · {fileSize}
    {:else if !fileInfoLoading && fileName !== "no file open"}
      {fileName}
    {:else if !fileSrc}
      no file open
    {/if}
  </span>
  <div class="bottombar-right">
    <button
      class="zoom tooltip-above"
      data-tooltip="Reset zoom"
      onclick={resetZoom}>{Math.round(zoomLevel)}%</button
    >
    <button
      class="fs-btn tooltip-above-shift-left"
      data-tooltip="Fullscreen"
      onclick={toggleFullscreen}
      aria-label="toggle fullscreen"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
        ><path
          d="M1 4V1H4M8 1H11V4M11 8V11H8M4 11H1V8"
          stroke="currentColor"
          stroke-width="0.6"
          stroke-linecap="round"
        /></svg
      >
    </button>
  </div>
</div>

{#if isVideo && clipCount > 0 && !dismissed}
  <div
    class="clip-actions"
    transition:fly={{ y: 26, duration: 190, opacity: 0.08 }}
  >
    <div
      class="ctx-drag"
      role="button"
      tabindex="0"
      aria-label="Drag to move"
      onmousedown={(e) => {
        e.preventDefault();
        const menu = (e.currentTarget as HTMLElement).closest(
          ".clip-actions",
        ) as HTMLElement;
        if (!menu) return;
        const startX = e.clientX;
        const startY = e.clientY;
        const rect = menu.getBoundingClientRect();
        const startLeft = rect.left;
        const startTop = rect.top;

        function onMouseMove(ev: MouseEvent) {
          menu.style.left = `${startLeft + ev.clientX - startX}px`;
          menu.style.top = `${startTop + ev.clientY - startY}px`;
          menu.style.bottom = "auto";
          menu.style.height = "fit-content";
          menu.style.transform = "none";
        }

        function onMouseUp() {
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);
        }

        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
      }}
    >
      <span class="ctx-dot"></span><span class="ctx-dot"></span><span
        class="ctx-dot"
      ></span>
      <button
        class="ctx-close"
        onclick={(e) => {
          e.stopPropagation();
          dismissed = true;
        }}
        onmousedown={(e) => e.stopPropagation()}
        aria-label="Close"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
    <button
      class="clip-main-btn"
      onclick={triggerClipSegments}
      disabled={clipJobRunning}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        ><circle
          cx="6.5"
          cy="8"
          r="2.5"
          stroke="currentColor"
          stroke-width="2"
        /><circle
          cx="6.5"
          cy="16"
          r="2.5"
          stroke="currentColor"
          stroke-width="2"
        /><path
          d="M9 9.5L20 4M9 14.5L20 20"
          stroke="currentColor"
          stroke-width="2"
        /></svg
      >
      <span>Clip Segments</span>
    </button>
    <div class="clip-options-grid">
      <button
        class="clip-toggle-btn red"
        class:is-on={clipDeleteOriginal}
        onclick={toggleClipDeleteOriginal}
        disabled={clipJobRunning}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          ><path
            d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2M3 6h18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /></svg
        >
        <span>Delete Original</span>
      </button>
      <button
        class="clip-toggle-btn yellow tooltip-above"
        class:is-on={clipUseCustomPath}
        data-tooltip={getClipTargetDir() || "No output path"}
        title={getClipTargetDir() || "No output path"}
        onclick={toggleClipPathSelection}
        disabled={clipJobRunning}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          ><path
            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            stroke="currentColor"
            stroke-width="2"
          /></svg
        >
        <span>Select Path</span>
      </button>
      <button
        class="clip-toggle-btn green"
        class:is-on={clipMergeSegments}
        onclick={toggleClipMergeSegments}
        disabled={clipJobRunning}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          ><path
            d="M5 7h14M5 12h14M5 17h14M8 7v10M16 7v10"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /></svg
        >
        <span>Merge Segments</span>
      </button>
    </div>
    {#if clipJobRunning}
      <div class="clip-job-progress">
        <span>{clipJobLabel}</span>
        <div class="clip-job-bar"><span></span></div>
      </div>
    {/if}
  </div>
{/if}
