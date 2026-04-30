<script lang="ts">
  let {
    visible,
    onClose,
    onOpenSettings,
  }: {
    visible: boolean;
    onClose: () => void;
    onOpenSettings: () => void;
  } = $props();

  function handleItemClick(action: string) {
    if (action === "settings") {
      onOpenSettings();
    }
    onClose();
  }
</script>

{#if visible}
  <div class="app-dropdown-menu">
    <div class="app-dropdown-header">
      <span class="app-dropdown-title"><span>v{__APP_VERSION__}</span></span>
    </div>
    <div class="app-dropdown-separator"></div>
    <button
      class="app-dropdown-item"
      onclick={() => handleItemClick("settings")}
    >
      Settings
    </button>
    <button
      class="app-dropdown-item"
      onclick={() => handleItemClick("accessibility")}
    >
      Accessibility
    </button>
    <button class="app-dropdown-item" onclick={() => handleItemClick("help")}>
      Help
    </button>
    <button
      class="app-dropdown-item"
      onclick={() => handleItemClick("feedback")}
    >
      Feedback
    </button>
    <div class="app-dropdown-separator"></div>
    <button class="app-dropdown-item" onclick={() => handleItemClick("about")}>
      About
    </button>
  </div>
{/if}
