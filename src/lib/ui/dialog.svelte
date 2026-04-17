<script lang="ts">
  import { fade } from "svelte/transition";
  import type { ClipBoundary, CtxMenu, Timestamp } from "$lib/types";

  let {
    contextMenu,
    isVideo,
    timestamps,
    clipBoundaries,
    frameCopyToast,
    clipToast,
    clipOutputDir,
    parentFolder,
    invokeOpenDirectory,
    ctxCopyImage,
    ctxCopyFrame,
    ctxCopyPath,
    ctxRotate,
    ctxFlip,
    ctxStartClipHere,
    ctxEndClipHere,
    ctxShowInExplorer,
    ctxProperties,
    ctxDelete,
    ctxClearTimestamps,
    ctxClearSegments,
  }: {
    contextMenu: CtxMenu;
    isVideo: boolean;
    timestamps: Timestamp[];
    clipBoundaries: ClipBoundary[];
    frameCopyToast: { visible: boolean; message: string; tone: "success" | "error" };
    clipToast: {
      visible: boolean;
      tone: "success" | "error";
      message: string;
      outputDir: string;
    };
    clipOutputDir: string;
    parentFolder: () => string;
    invokeOpenDirectory: (path: string) => Promise<void>;
    ctxCopyImage: () => void;
    ctxCopyFrame: () => void;
    ctxCopyPath: () => void;
    ctxRotate: () => void;
    ctxFlip: () => void;
    ctxStartClipHere: () => void;
    ctxEndClipHere: () => void;
    ctxShowInExplorer: () => void;
    ctxProperties: () => void;
    ctxDelete: () => void;
    ctxClearTimestamps: () => void;
    ctxClearSegments: () => void;
  } = $props();
</script>

{#if contextMenu.visible}
  <div
    class="context-menu"
    style="left: {contextMenu.x}px; top: {contextMenu.y}px;"
    role="menu"
  >
    {#if !isVideo}
      <button class="ctx-item green" onclick={ctxCopyImage} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><rect
            x="8"
            y="8"
            width="13"
            height="13"
            rx="2"
            stroke="currentColor"
            stroke-width="2"
          /><path
            d="M4 16V5a1 1 0 011-1h11"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /></svg
        >
        Copy image
      </button>
      <button class="ctx-item green" onclick={ctxCopyPath} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><path
            d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><path
            d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /></svg
        >
        Copy file path
      </button>
      <div class="ctx-sep"></div>
      <button class="ctx-item blue" onclick={ctxRotate} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><path
            d="M21 2v6h-6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          /><path
            d="M21 13a9 9 0 11-3-7.7L21 8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /></svg
        >
        Rotate 90°
      </button>
      <button class="ctx-item blue" onclick={ctxFlip} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><path
            d="M12 3v18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><path
            d="M5 8l-3 4 3 4M19 8l3 4-3 4"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          /></svg
        >
        Flip horizontal
      </button>
      <div class="ctx-sep"></div>
      <button class="ctx-item yellow" onclick={ctxShowInExplorer} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><path
            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            stroke="currentColor"
            stroke-width="2"
          /></svg
        >
        Show in explorer
      </button>
      <button class="ctx-item yellow" onclick={ctxProperties} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path
            d="M12 10.5V16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><circle cx="12" cy="7.5" r="1" fill="currentColor" /></svg
        >
        Properties
      </button>
      <div class="ctx-sep"></div>
      <button class="ctx-item red" onclick={ctxDelete} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><polyline
            points="3 6 5 6 21 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><path
            d="M19 6l-1 14H6L5 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><path
            d="M10 11v6M14 11v6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><path d="M9 6V4h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg
        >
        Delete
      </button>
    {:else}
      <button class="ctx-item green" onclick={ctxCopyFrame} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><rect
            x="2"
            y="4"
            width="20"
            height="16"
            rx="2"
            stroke="currentColor"
            stroke-width="2"
          /><circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" /><path
            d="M2 17l5-5 4 4 3-3 5 5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /></svg
        >
        Copy current frame
      </button>
      <button class="ctx-item green" onclick={ctxCopyPath} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><path
            d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><path
            d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /></svg
        >
        Copy file path
      </button>
      <div class="ctx-sep"></div>
      <button class="ctx-item blue" onclick={ctxStartClipHere} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><circle cx="7" cy="8" r="2.2" stroke="currentColor" stroke-width="1.8" /><circle
            cx="7"
            cy="15.8"
            r="2.2"
            stroke="currentColor"
            stroke-width="1.8"
          /><path d="M9.5 9.6L19 5.2M9.5 14.2L19 19" stroke="currentColor" stroke-width="1.8" /></svg
        >
        Start Clip Here
      </button>
      <button class="ctx-item blue" onclick={ctxEndClipHere} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><circle cx="17" cy="8" r="2.2" stroke="currentColor" stroke-width="1.8" /><circle
            cx="17"
            cy="15.8"
            r="2.2"
            stroke="currentColor"
            stroke-width="1.8"
          /><path d="M14.5 9.6L5 5.2M14.5 14.2L5 19" stroke="currentColor" stroke-width="1.8" /></svg
        >
        End Clip Here
      </button>
      <div class="ctx-sep"></div>
      <button class="ctx-item yellow" onclick={ctxShowInExplorer} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><path
            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            stroke="currentColor"
            stroke-width="2"
          /></svg
        >
        Show in explorer
      </button>
      <button class="ctx-item yellow" onclick={ctxProperties} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path
            d="M12 10.5V16"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><circle cx="12" cy="7.5" r="1" fill="currentColor" /></svg
        >
        Properties
      </button>
      <div class="ctx-sep"></div>
      {#if timestamps.length > 0}
        <button class="ctx-item red" onclick={ctxClearTimestamps} role="menuitem">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            ><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path
              d="M9 9l6 6M15 9l-6 6"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            /></svg
          >
          Delete Timestamps
        </button>
      {/if}
      {#if clipBoundaries.length > 0}
        <button class="ctx-item red" onclick={ctxClearSegments} role="menuitem">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            ><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path
              d="M8 8l8 8M16 8l-8 8"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            /></svg
          >
          Delete Segments
        </button>
      {/if}
      <button class="ctx-item red" onclick={ctxDelete} role="menuitem">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
          ><polyline
            points="3 6 5 6 21 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><path
            d="M19 6l-1 14H6L5 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><path
            d="M10 11v6M14 11v6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          /><path d="M9 6V4h6v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg
        >
        Delete
      </button>
    {/if}
  </div>
{/if}

{#if frameCopyToast.visible}
  <div
    class="copy-toast"
    class:error={frameCopyToast.tone === "error"}
    role="status"
    aria-live="polite"
  >
    {frameCopyToast.message}
  </div>
{/if}

{#if clipToast.visible}
  <div
    class="clip-toast"
    class:error={clipToast.tone === "error"}
    role="status"
    aria-live="polite"
    transition:fade={{ duration: 220 }}
  >
    <span>{clipToast.message}</span>
    {#if clipToast.tone === "success"}
      <button
        class="clip-toast-folder"
        onclick={async () => {
          try {
            await invokeOpenDirectory(clipToast.outputDir || clipOutputDir || parentFolder());
          } catch {}
        }}
        aria-label="open output folder"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          ><path
            d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
            stroke="currentColor"
            stroke-width="2"
          /></svg
        ></button
      >
    {/if}
  </div>
{/if}
