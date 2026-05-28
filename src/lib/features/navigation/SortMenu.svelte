<script lang="ts">
  import { SORT_MODES } from "$lib/shared/constants";
  import type { SortMode } from "$lib/shared/constants";

  let {
    visible,
    onClose,
    sortMode,
    sortDesc,
    onSortChange,
  }: {
    visible: boolean;
    onClose: () => void;
    sortMode: SortMode;
    sortDesc: boolean;
    onSortChange: (mode: SortMode, desc: boolean) => void;
  } = $props();

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
  <div class="sort-menu">
    {#each SORT_MODES as option}
      <button
        class="sort-menu-item"
        class:active={sortMode === option.value}
        onclick={() => onSortChange(option.value, sortMode === option.value ? !sortDesc : sortDesc)}
      >
        <span class="sort-menu-label">{option.label}</span>
        {#if sortMode === option.value}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        {/if}
      </button>
    {/each}
    <div class="sort-menu-separator"></div>
    <button
      class="sort-menu-item sort-dir"
      onclick={() => onSortChange(sortMode, !sortDesc)}
    >
      <svg
        width="10"
        height="10"
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
      <span class="sort-menu-label">{sortDesc ? "Descending" : "Ascending"}</span>
    </button>
  </div>
{/if}
