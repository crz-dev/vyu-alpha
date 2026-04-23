<script lang="ts">
  import { fly } from "svelte/transition";

  let {
    visible,
  }: {
    visible: boolean;
  } = $props();
</script>

{#if visible}
  <div
    class="edit-menu"
    transition:fly={{ y: -26, duration: 190, opacity: 0.08 }}
  >
    <div class="edit-menu-grid">
      <button class="edit-menu-btn red">
        <span>Placeholder 1</span>
      </button>
      <button class="edit-menu-btn blue">
        <span>Placeholder 2</span>
      </button>
      <button class="edit-menu-btn yellow">
        <span>Placeholder 3</span>
      </button>
      <button class="edit-menu-btn green">
        <span>Placeholder 4</span>
      </button>
    </div>
  </div>
{/if}
