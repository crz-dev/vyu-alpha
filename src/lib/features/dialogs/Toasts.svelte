<script lang="ts">
  let {
    frameCopyToast,
    imageCopyToast,
    clipToast,
    exportToast,
    clipboardToast,
    onOpenExportedFile,
    onSaveClipboardFile,
    onDismissClipboardToast,
    clipOutputDir,
    parentFolder,
    invokeOpenDirectory,
  }: {
    frameCopyToast: {
      visible: boolean;
      message: string;
      tone: "success" | "error" | "info";
    };
    imageCopyToast: {
      visible: boolean;
      message: string;
      tone: "success" | "error" | "info";
    };
    clipToast: {
      visible: boolean;
      tone: "success" | "error";
      message: string;
      outputDir: string;
    };
    exportToast: {
      visible: boolean;
      phase: "exporting" | "done" | "error";
      message: string;
      outputPath: string;
    };
    clipboardToast: {
      visible: boolean;
      filePath: string;
    };
    onOpenExportedFile: () => void;
    onSaveClipboardFile: () => void;
    onDismissClipboardToast: () => void;
    clipOutputDir: string;
    parentFolder: () => string;
    invokeOpenDirectory: (path: string) => Promise<void>;
  } = $props();
</script>

{#if frameCopyToast.visible}
  <div
    class="copy-toast"
    class:error={frameCopyToast.tone === "error"}
    class:info={frameCopyToast.tone === "info"}
    role="status"
    aria-live="polite"
  >
    {frameCopyToast.message}
  </div>
{/if}

{#if imageCopyToast.visible}
  <div
    class="copy-toast"
    class:error={imageCopyToast.tone === "error"}
    class:info={imageCopyToast.tone === "info"}
    role="status"
    aria-live="polite"
  >
    {imageCopyToast.message}
  </div>
{/if}

{#if clipToast.visible}
  <div
    class="clip-toast"
    class:error={clipToast.tone === "error"}
    role="status"
    aria-live="polite"
  >
    <span>{clipToast.message}</span>
    {#if clipToast.tone === "success"}
      <button
        class="clip-toast-folder"
        onclick={async () => {
          try {
            await invokeOpenDirectory(
              clipToast.outputDir || clipOutputDir || parentFolder(),
            );
          } catch (e) {
            console.error("Failed to open clip output directory:", e);
          }
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

{#if exportToast.visible}
  <div
    class="export-toast"
    class:exporting={exportToast.phase === "exporting"}
    class:done={exportToast.phase === "done"}
    class:error={exportToast.phase === "error"}
    role="status"
    aria-live="polite"
  >
    <div class="export-toast-content">
      <span>{exportToast.message}</span>
      {#if exportToast.phase === "done"}
        <button
          class="export-toast-open-btn"
          onclick={onOpenExportedFile}
          title="Open in Vyu"
          aria-label="Open in Vyu"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      {/if}
    </div>
    {#if exportToast.phase === "exporting"}
      <div class="export-toast-progress">
        <div class="export-toast-progress-bar"></div>
      </div>
    {/if}
  </div>
{/if}

{#if clipboardToast.visible}
  <div class="clipboard-toast" role="status" aria-live="polite">
    <span class="clipboard-toast-text"
      >This file is from the clipboard. Save it?</span
    >
    <div class="clipboard-toast-actions">
      <button
        class="clipboard-toast-btn save"
        onclick={onSaveClipboardFile}
        title="Save to folder"
        aria-label="Save to folder"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </button>
      <button
        class="clipboard-toast-btn dismiss"
        onclick={onDismissClipboardToast}
        title="Dismiss"
        aria-label="Dismiss"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
{/if}
