<script lang="ts">
  let {
    fileName,
    fileSrc,
    startDrag,
    showFilenameTooltip,
    hideFilenameTooltip,
    closeFile,
    openFileDialog,
    minimizeWindow,
    maximizeWindow,
    closeWindow,
  }: {
    fileName: string;
    fileSrc: string;
    startDrag: (e: MouseEvent) => void;
    showFilenameTooltip: (e: MouseEvent) => void;
    hideFilenameTooltip: () => void;
    closeFile: () => void;
    openFileDialog: () => void;
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
  } = $props();
</script>

<div class="topbar" onmousedown={startDrag} role="toolbar" tabindex="-1">
  <span class="app-name">vyu</span>
  <span class="divider">/</span>
  <span
    class="filename"
    role="presentation"
    onmouseenter={showFilenameTooltip}
    onmouseleave={hideFilenameTooltip}>{fileName}</span
  >
  {#if fileSrc}
    <span class="divider">/</span>
    <button
      class="folder-btn close-file-btn tooltip-below"
      data-tooltip="Close file"
      onclick={closeFile}
      aria-label="close file"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M8 3h7l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"
          stroke="currentColor"
          stroke-width="2"
        />
        <path d="M15 3v5h5" stroke="currentColor" stroke-width="2" />
        <path
          d="M11 12H4"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M7 9l-3 3 3 3"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <span class="divider">/</span>
    <button
      class="folder-btn open-file-btn tooltip-below"
      data-tooltip="Open file"
      onclick={openFileDialog}
      aria-label="open file"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
          stroke="currentColor"
          stroke-width="2"
        />
      </svg>
    </button>
  {/if}
  <div class="window-controls">
    <button
      class="wc-btn tooltip-below"
      data-tooltip="Minimize"
      onclick={minimizeWindow}
      aria-label="minimize">−</button
    >
    <button
      class="wc-btn tooltip-below"
      data-tooltip="Maximize"
      onclick={maximizeWindow}
      aria-label="maximize">▢</button
    >
    <button
      class="wc-btn close tooltip-below"
      data-tooltip="Close"
      onclick={closeWindow}
      aria-label="close">✕</button
    >
  </div>
</div>
