<script lang="ts">
  let {
    helpOpen,
    closeHelp,
  }: {
    helpOpen: boolean;
    closeHelp: () => void;
  } = $props();

  const LAST_SECTION_KEY = "vyu-help-last-section";

  let activeSection = $state(
    localStorage.getItem(LAST_SECTION_KEY) ?? "quick-start",
  );
  let contentEl = $state<HTMLDivElement | null>(null);
  let flashId = $state<string | null>(null);
  let isScrolling = $state(false);
  let scrollTimeout = $state<ReturnType<typeof setTimeout> | null>(null);
  let flashTimeout = $state<ReturnType<typeof setTimeout> | null>(null);

  $effect(() => {
    localStorage.setItem(LAST_SECTION_KEY, activeSection);
  });

  $effect(() => {
    if (helpOpen) {
      requestAnimationFrame(() => {
        const el = document.getElementById(`help-section-${activeSection}`);
        if (el) {
          el.scrollIntoView({ block: "start" });
        }
      });
    }
  });

  const sections = [
    { id: "quick-start", label: "Quick start" },
    { id: "tips", label: "Tips" },
    { id: "troubleshooting", label: "Troubleshooting" },
  ];

  const sectionDescriptions: Record<string, string> = {
    "quick-start": "Get up and running with vyu in seconds.",
    tips: "Hidden features and power-user tricks.",
    troubleshooting: "Fix common issues quickly.",
  };

  function scrollToSection(id: string) {
    activeSection = id;
    if (scrollTimeout) clearTimeout(scrollTimeout);
    if (flashTimeout) clearTimeout(flashTimeout);
    isScrolling = true;
    const el = document.getElementById(`help-section-${id}`);
    if (el && contentEl) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      flashId = id;
      flashTimeout = setTimeout(() => {
        if (flashId === id) flashId = null;
      }, 900);
    }
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
    }, 700);
  }

  function handleScroll() {
    if (!contentEl || isScrolling) return;
    const nearBottom =
      contentEl.scrollTop + contentEl.clientHeight >=
      contentEl.scrollHeight - 8;
    if (nearBottom) {
      activeSection = sections[sections.length - 1].id;
      return;
    }
    const containerRect = contentEl.getBoundingClientRect();
    const threshold = containerRect.top + contentEl.clientHeight * 0.35;
    let current = sections[0].id;
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(`help-section-${sections[i].id}`);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= threshold) {
          current = sections[i].id;
          break;
        }
      }
    }
    activeSection = current;
  }


</script>

{#if helpOpen}
  <div
    class="delete-overlay"
    role="presentation"
    onmousedown={(e) => {
      if (e.target === e.currentTarget) closeHelp();
    }}
  >

    <div class="delete-dialog help-dialog" role="dialog" aria-modal="true">
      <div class="settings-header-bar">
        <p class="delete-title">Help</p>
        <p class="delete-subtitle">Learn how to use vyu</p>
      </div>

      <div class="settings-layout">
        <nav class="settings-nav">
          {#each sections as sec}
            <button
              class="settings-nav-item"
              class:active={activeSection === sec.id}
              data-section={sec.id}
              onclick={() => scrollToSection(sec.id)}
            >
              {#if sec.id === "quick-start"}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><polygon
                    points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                  /></svg
                >
              {:else if sec.id === "tips"}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><path
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  /></svg
                >
              {:else if sec.id === "troubleshooting"}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  ><circle cx="12" cy="12" r="10" /><line
                    x1="12"
                    y1="8"
                    x2="12"
                    y2="12"
                  /><line x1="12" y1="16" x2="12.01" y2="16" /></svg
                >
              {/if}
              {sec.label}
            </button>
          {/each}
          <div class="settings-nav-spacer"></div>
          <div class="settings-nav-description">
            {#key activeSection}
              <p class="settings-nav-description-text">
                {sectionDescriptions[activeSection] ?? ""}
              </p>
            {/key}
          </div>
        </nav>

        <div
          class="settings-content"
          bind:this={contentEl}
          onscroll={handleScroll}
        >
          <div
            id="help-section-quick-start"
            class="settings-section"
            class:flash={flashId === "quick-start"}
          >
            <p class="settings-section-header">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><polygon
                  points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                /></svg
              >
              Quick start
            </p>
            <div class="settings-row help-text-row">
              <div class="help-text">
                <p>
                  <strong>Open a file</strong> — Click the folder icon in the
                  top bar or press <span class="help-kbd-inline">Ctrl+O</span>.
                </p>
                <p>
                  <strong>Navigate</strong> — Use the arrow buttons or keyboard shortcuts
                  to move between files in the same folder.
                </p>
                <p>
                  <strong>Fullscreen</strong> — Double-click the viewer or press
                  <span class="help-kbd-inline">F</span>.
                </p>
                <p>
                  <strong>Zoom & Pan</strong> — Scroll to zoom, click and drag to
                  pan when zoomed in.
                </p>
              </div>
            </div>
          </div>

          <div
            id="help-section-tips"
            class="settings-section"
            class:flash={flashId === "tips"}
          >
            <p class="settings-section-header">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><path
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                /></svg
              >
              Tips
            </p>
            <div class="settings-row help-text-row">
              <div class="help-text">
                <p>
                  <strong>Slideshow mode</strong> — Enable automatic playback through
                  a folder with custom timing.
                </p>
                <p>
                  <strong>Timestamps</strong> — Press
                  <span class="help-kbd-inline">T</span> while a video is playing
                  to mark a moment.
                </p>
                <p>
                  <strong>Crop tool</strong> — Enter crop mode in the Edit menu to
                  export a cropped region.
                </p>
                <p>
                  <strong>Drag & drop</strong> — Drop a file directly onto the window
                  to open it instantly.
                </p>
                <p>
                  <strong>Clipboard paste</strong> — Paste an image from your clipboard
                  to view it without saving.
                </p>
              </div>
            </div>
          </div>

          <div
            id="help-section-troubleshooting"
            class="settings-section"
            class:flash={flashId === "troubleshooting"}
          >
            <p class="settings-section-header">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                ><circle cx="12" cy="12" r="10" /><line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="12"
                /><line x1="12" y1="16" x2="12.01" y2="16" /></svg
              >
              Troubleshooting
            </p>
            <div class="settings-row help-text-row">
              <div class="help-text">
                <p>
                  <strong>Video won't play?</strong> — Make sure the file is a supported
                  format (MP4, MKV, WebM, MOV).
                </p>
                <p>
                  <strong>No audio?</strong> — Check that the volume is up and the
                  file contains an audio track.
                </p>
                <p>
                  <strong>FFmpeg missing?</strong> — Install FFmpeg via the prompt
                  in Properties or Process menus for advanced features.
                </p>
                <p>
                  <strong>Performance issues?</strong> — Try disabling hardware acceleration
                  in Settings > System.
                </p>
                <p>
                  <strong>Shortcuts not working?</strong> — Make sure you are not
                  focused on a text field or menu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="delete-actions">
        <button class="delete-cancel" onclick={closeHelp}>Close</button>
      </div>
    </div>
  </div>
{/if}
