<script lang="ts">
  import { fly } from "svelte/transition";
  import { editing } from "$lib/features/editing/editing.svelte";

  let {
    onApply,
    onExport,
    onUndo,
    onReset,
  }: {
    onApply: () => void;
    onExport: () => void;
    onUndo: () => void;
    onReset: () => void;
  } = $props();

  const canUndo = $derived(editing.getCanUndo());
  const hasEdits = $derived(editing.getHasEdits() || editing.getCropBounds() !== null);
</script>

{#if hasEdits}
  <div class="edit-actions-bar" transition:fly={{ y: -8, duration: 180, opacity: 0 }}>
    <button
      class="edit-action-btn red tooltip-ctrl"
      class:inactive={!hasEdits}
      disabled={!hasEdits}
      onclick={onReset}
      data-tooltip="Reset"
      aria-label="Reset"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
      </svg>
    </button>
    <button
      class="edit-action-btn blue tooltip-ctrl"
      class:inactive={!canUndo}
      disabled={!canUndo}
      onclick={onUndo}
      data-tooltip="Undo"
      aria-label="Undo"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </button>
    <button
      class="edit-action-btn yellow tooltip-ctrl"
      class:inactive={!hasEdits}
      disabled={!hasEdits}
      onclick={onExport}
      data-tooltip="Export"
      aria-label="Export"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17,8 12,3 7,8" />
        <line x1="12" y1="3" x2="12" y2="15" />
      </svg>
    </button>
    <button
      class="edit-action-btn green tooltip-ctrl"
      class:inactive={!hasEdits}
      disabled={!hasEdits}
      onclick={onApply}
      data-tooltip="Apply"
      aria-label="Apply"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </button>
  </div>
{/if}
