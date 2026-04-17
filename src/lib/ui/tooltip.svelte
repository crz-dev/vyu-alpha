<script lang="ts">
  let {
    tsTooltip,
    tsEditMenuVisible,
    volumeTooltipVisible,
    volumeTooltipX,
    volumeTooltipY,
    muted,
    volume,
  }: {
    tsTooltip: {
      visible: boolean;
      x: number;
      y: number;
      title?: string;
      timeLabel: string;
      tone?: "yellow" | "blue" | "green";
    };
    tsEditMenuVisible: boolean;
    volumeTooltipVisible: boolean;
    volumeTooltipX: number;
    volumeTooltipY: number;
    muted: boolean;
    volume: number;
  } = $props();
</script>

{#if tsTooltip.visible && !tsEditMenuVisible}
  <div
    class="ts-tooltip"
    class:blue={tsTooltip.tone === "blue"}
    class:green={tsTooltip.tone === "green"}
    style="left: {tsTooltip.x}px; top: {tsTooltip.y}px;"
  >
    {#if tsTooltip.title}
      <span class="ts-tooltip-title">{tsTooltip.title}</span>
    {/if}
    <span>{tsTooltip.timeLabel}</span>
  </div>
{/if}

{#if volumeTooltipVisible}
  <div
    class="vol-tooltip"
    style="left: {volumeTooltipX}px; top: {volumeTooltipY - 32}px;"
  >
    {muted ? "0" : Math.round(volume * 100)}%
  </div>
{/if}

<div
  id="filename-tooltip"
  style="position:fixed;opacity:0;transition:opacity 0.15s ease 0.4s;background:#1a1a1a;color:#aaaaaa;font-size:11px;font-family:Inter,sans-serif;white-space:nowrap;padding:4px 8px;border-radius:4px;border:0.5px solid #2a2a2a;pointer-events:none;z-index:9999;"
></div>
