<script lang="ts">
  import { SORT_MODES } from "$lib/shared/constants";
  import type { SortMode } from "$lib/shared/constants";

  let {
    visible,
    onClose,
    x,
    y,
    sortMode,
    sortDesc,
    onSortChange,
  }: {
    visible: boolean;
    onClose: () => void;
    x: number;
    y: number;
    sortMode: SortMode;
    sortDesc: boolean;
    onSortChange: (mode: SortMode, desc: boolean) => void;
  } = $props();

  const SORT_ICONS: Record<string, string> = {
    name: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="14" y2="18"/></svg>`,
    "date-modified": `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
    size: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    type: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  };

  function handleWindowMouseDown(e: MouseEvent) {
    if (
      visible &&
      !(e.target as HTMLElement).closest(".sort-menu") &&
      !(e.target as HTMLElement).closest(".file-count") &&
      !(e.target as HTMLElement).closest(".fs-file-count-pill")
    ) {
      onClose();
    }
  }
</script>

<svelte:window onmousedown={handleWindowMouseDown} />

{#if visible}
  <div class="sort-menu" style="left: {x + 88}px; bottom: {y + 0}px;">
    <div class="sort-menu-header">
      <span class="sort-menu-title">Sort files by</span>
    </div>
    <div class="sort-menu-separator"></div>
    {#each SORT_MODES as option}
      <button
        class="sort-menu-item"
        class:active={sortMode === option.value}
        onclick={() =>
          onSortChange(
            option.value,
            sortMode === option.value ? !sortDesc : sortDesc,
          )}
      >
        {@html SORT_ICONS[option.value]}
        <span class="sort-menu-label">{option.label}</span>
      </button>
    {/each}
    <div class="sort-menu-separator"></div>
    <button
      class="sort-menu-item sort-dir"
      onclick={() => onSortChange(sortMode, !sortDesc)}
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
        style={sortDesc ? "transform: scaleY(-1)" : ""}
      >
        <path d="M12 5v14M5 12l7-7 7 7" />
      </svg>
      <span class="sort-menu-label"
        >{sortDesc ? "Descending" : "Ascending"}</span
      >
    </button>
  </div>
{/if}
