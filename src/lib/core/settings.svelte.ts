import type { CtxMenu, MediaProperties, TimestampDragRange } from "$lib/types";

export class DialogState {
  contextMenu: CtxMenu = $state({ x: 0, y: 0, visible: false });
  deleteConfirm = $state(false);
  deletePermanently = $state(false);
  deleteNoAsk = $state(false);
  propertiesOpen = $state(false);

  closeAll() {
    this.contextMenu.visible = false;
    this.deleteConfirm = false;
    this.propertiesOpen = false;
  }
}

export class MediaInfoState {
  props: MediaProperties | null = $state(null);
  loading = $state(false);
  ffprobeAvailable = $state(true);
  ffprobeChecked = $state(false);
  ffmpegInstalling = $state(false);
  ffmpegInstallError = $state("");
}

export class ClipExportState {
  outputDir = $state("");
  deleteOriginal = $state(false);
  useCustomPath = $state(false);
  mergeSegments = $state(false);
  jobRunning = $state(false);
  jobLabel = $state("");
  deleteConfirm: { visible: boolean; mode: "separate" | "merge" | null } = $state({ visible: false, mode: null });
  toast: { visible: boolean; tone: "success" | "error"; message: string; outputDir: string } = $state({ visible: false, tone: "success", message: "", outputDir: "" });
  
  toastTimer: ReturnType<typeof setTimeout> | undefined;
  markerJustDragged = $state(false);

  showToast(message: string, tone: "success" | "error", outputDir: string) {
    clearTimeout(this.toastTimer);
    this.toast = { visible: true, tone, message, outputDir };
    this.toastTimer = setTimeout(() => {
      this.toast.visible = false;
    }, 4200);
  }
}

export class TimelineUIState {
  tooltip: { visible: boolean; x: number; y: number; title?: string; timeLabel: string; tone?: "yellow" | "blue" | "green" } = $state({ visible: false, x: 0, y: 0, title: "", timeLabel: "", tone: "yellow" });
  editMenu: { visible: boolean; x: number; y: number; targetId: string; targetType: "timestamp" | "segment" } = $state({ visible: false, x: 0, y: 0, targetId: "", targetType: "timestamp" });
  dragRange: TimestampDragRange = $state({ visible: false, start: 0, end: 0, phase: "idle" });
  
  hoverTimestampId: string | null = $state(null);
  hoverBoundaryId: string | null = $state(null);
  markerDragJustEnded = $state(false);
  dragFadeTimer: ReturnType<typeof setTimeout> | undefined;

  resumeTooltipVisible = $state(false);

  clearDragRange() {
    clearTimeout(this.dragFadeTimer);
    this.dragRange = { visible: false, start: 0, end: 0, phase: "idle" };
    this.hoverTimestampId = null;
    this.hoverBoundaryId = null;
  }
}
