<script lang="ts">
  let {
    settingsOpen,
    closeSettings,
  }: {
    settingsOpen: boolean;
    closeSettings: () => void;
  } = $props();

  let theme = $state<"dark" | "light" | "system">("dark");
  let volumeBoost = $state(false);
  let resumePlayback = $state(true);
  let autoSaveMarkers = $state(true);
  let defaultQuality = $state<"fast" | "balanced" | "quality">("balanced");
  let hardwareAcceleration = $state(true);
</script>

{#if settingsOpen}
  <div
    class="delete-overlay"
    role="presentation"
    onmousedown={(e) => {
      if (e.target === e.currentTarget) closeSettings();
    }}
  >
    <div class="delete-dialog settings-dialog" role="dialog" aria-modal="true">
      <p class="delete-title">Settings</p>
      <p class="delete-subtitle">Configure your media viewer experience</p>

      <div class="settings-body">
        <!-- Appearance -->
        <div class="settings-section">
          <p class="settings-header">Appearance</p>
          <div class="settings-row">
            <div class="settings-label-col">
              <span class="settings-label">Theme</span>
            </div>
            <div class="settings-control">
              <div class="pill-group">
                <button
                  class="pill-btn"
                  class:active={theme === "dark"}
                  onclick={() => (theme = "dark")}
                >
                  Dark
                </button>
                <button
                  class="pill-btn"
                  class:active={theme === "light"}
                  onclick={() => (theme = "light")}
                >
                  Light
                </button>
                <button
                  class="pill-btn"
                  class:active={theme === "system"}
                  onclick={() => (theme = "system")}
                >
                  System
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Playback -->
        <div class="settings-section">
          <p class="settings-header">Playback</p>
          <div class="settings-row">
            <div class="settings-label-col">
              <span class="settings-label">Volume Boost</span>
              <span class="settings-hint">Allow volume up to 200%</span>
            </div>
            <div class="settings-control">
              <label class="toggle-row">
                <input
                  type="checkbox"
                  checked={volumeBoost}
                  onchange={(e) => (volumeBoost = e.currentTarget.checked)}
                />
                <span class="toggle-track" class:on={volumeBoost}
                  ><span class="toggle-thumb"></span></span
                >
              </label>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label-col">
              <span class="settings-label">Resume Playback</span>
              <span class="settings-hint">Remember position for each file</span>
            </div>
            <div class="settings-control">
              <label class="toggle-row">
                <input
                  type="checkbox"
                  checked={resumePlayback}
                  onchange={(e) => (resumePlayback = e.currentTarget.checked)}
                />
                <span class="toggle-track" class:on={resumePlayback}
                  ><span class="toggle-thumb"></span></span
                >
              </label>
            </div>
          </div>
        </div>

        <!-- Editor -->
        <div class="settings-section">
          <p class="settings-header">Editor</p>
          <div class="settings-row">
            <div class="settings-label-col">
              <span class="settings-label">Auto-save Markers</span>
              <span class="settings-hint">Save timestamps &amp; clips automatically</span>
            </div>
            <div class="settings-control">
              <label class="toggle-row">
                <input
                  type="checkbox"
                  checked={autoSaveMarkers}
                  onchange={(e) => (autoSaveMarkers = e.currentTarget.checked)}
                />
                <span class="toggle-track" class:on={autoSaveMarkers}
                  ><span class="toggle-thumb"></span></span
                >
              </label>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label-col">
              <span class="settings-label">Default Export Quality</span>
            </div>
            <div class="settings-control">
              <div class="pill-group">
                <button
                  class="pill-btn"
                  class:active={defaultQuality === "fast"}
                  onclick={() => (defaultQuality = "fast")}
                >
                  Fast
                </button>
                <button
                  class="pill-btn"
                  class:active={defaultQuality === "balanced"}
                  onclick={() => (defaultQuality = "balanced")}
                >
                  Balanced
                </button>
                <button
                  class="pill-btn"
                  class:active={defaultQuality === "quality"}
                  onclick={() => (defaultQuality = "quality")}
                >
                  Quality
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- System -->
        <div class="settings-section">
          <p class="settings-header">System</p>
          <div class="settings-row">
            <div class="settings-label-col">
              <span class="settings-label">Hardware Acceleration</span>
              <span class="settings-hint">Use GPU for decoding when available</span>
            </div>
            <div class="settings-control">
              <label class="toggle-row">
                <input
                  type="checkbox"
                  checked={hardwareAcceleration}
                  onchange={(e) =>
                    (hardwareAcceleration = e.currentTarget.checked)}
                />
                <span class="toggle-track" class:on={hardwareAcceleration}
                  ><span class="toggle-thumb"></span></span
                >
              </label>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label-col">
              <span class="settings-label">Clear Cache</span>
              <span class="settings-hint">Remove temporary media data</span>
            </div>
            <div class="settings-control">
              <button class="settings-action-btn red">Clear</button>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-label-col">
              <span class="settings-label">Updates</span>
              <span class="settings-hint">Check for the latest version</span>
            </div>
            <div class="settings-control">
              <button class="settings-action-btn blue">Check</button>
            </div>
          </div>
        </div>
      </div>

      <div class="delete-actions">
        <button class="delete-cancel" onclick={closeSettings}>Close</button>
      </div>
    </div>
  </div>
{/if}
