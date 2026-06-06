import { save } from "@tauri-apps/plugin-dialog";
import { getFileExt } from "$lib/services/files";
import { editing } from "$lib/features/editing/editing.svelte";
import {
  exportEditedImage,
  invokeExportEditedMedia,
} from "$lib/features/media/tools";
import { menuStore } from "$lib/features/dialogs/menuVisibility.svelte";

export type PendingEditAction = "apply" | "export" | null;
export type ExportFormatOverride = "png" | null;

export interface ExportToastState {
  visible: boolean;
  phase: string;
  message: string;
  outputPath: string;
}

function createEditDialogStore() {
  let editApplyConfirm = $state(false);
  let editTransparencyConfirm = $state(false);
  let pendingEditAction = $state<PendingEditAction>(null);
  let exportFormatOverride = $state<ExportFormatOverride>(null);
  let exportToast = $state<ExportToastState>({
    visible: false,
    phase: "",
    message: "",
    outputPath: "",
  });

  return {
    get editApplyConfirm() {
      return editApplyConfirm;
    },
    set editApplyConfirm(v: boolean) {
      editApplyConfirm = v;
    },
    get editTransparencyConfirm() {
      return editTransparencyConfirm;
    },
    set editTransparencyConfirm(v: boolean) {
      editTransparencyConfirm = v;
    },
    get pendingEditAction() {
      return pendingEditAction;
    },
    set pendingEditAction(v: PendingEditAction) {
      pendingEditAction = v;
    },
    get exportFormatOverride() {
      return exportFormatOverride;
    },
    set exportFormatOverride(v: ExportFormatOverride) {
      exportFormatOverride = v;
    },
    get exportToast() {
      return exportToast;
    },
    set exportToast(v: ExportToastState) {
      exportToast = v;
    },
    closeAll() {
      editApplyConfirm = false;
      editTransparencyConfirm = false;
      pendingEditAction = null;
      exportFormatOverride = null;
    },
  };
}

export const editDialogStore = createEditDialogStore();

export interface EditActionsDeps {
  getFilePath: () => string;
  getFileName: () => string;
  getIsVideo: () => boolean;
  getVideoEl: () => HTMLVideoElement | null;
  loadFile: (path: string) => Promise<void>;
  showFrameCopyToast: (
    message: string,
    tone: "success" | "error" | "info",
  ) => void;
}

export function createEditActions(deps: EditActionsDeps) {
  function needsTransparencyDialog(): boolean {
    if (deps.getIsVideo()) return false;
    const ext = getFileExt(deps.getFilePath());
    return (
      ["jpg", "jpeg"].includes(ext) && editing.snapshot.rotation % 90 !== 0
    );
  }

  async function performApply() {
    try {
      editing.isApplying = true;
      await editing.backupOriginal(deps.getFilePath());

      const s = editing.snapshot;
      const filePath = deps.getFilePath();
      const isVideo = deps.getIsVideo();
      const videoEl = deps.getVideoEl();

      if (isVideo) {
        if (!videoEl || videoEl.videoWidth <= 0 || videoEl.videoHeight <= 0) {
          throw new Error("Video not ready for export");
        }
        await invokeExportEditedMedia(
          filePath,
          filePath,
          s,
          videoEl.videoWidth,
          videoEl.videoHeight,
        );
      } else if (editDialogStore.exportFormatOverride === "png") {
        const pngPath = filePath.replace(/\.\w+$/, ".png");
        await exportEditedImage(filePath, s, pngPath);
        await deps.loadFile(pngPath);
      } else {
        await exportEditedImage(filePath, s, filePath);
      }

      editing.isApplying = false;
      editing.isApplied = true;
      editDialogStore.exportFormatOverride = null;
      deps.showFrameCopyToast("Edits applied", "success");
    } catch (err) {
      editing.isApplying = false;
      editDialogStore.exportFormatOverride = null;
      const message =
        err instanceof Error ? err.message : "Failed to apply edits";
      deps.showFrameCopyToast(message, "error");
    }
  }

  async function performExport() {
    try {
      const filePath = deps.getFilePath();
      const fileName = deps.getFileName();
      const ext = getFileExt(filePath);
      const isVideo = deps.getIsVideo();
      const videoEl = deps.getVideoEl();
      const overrideExt =
        editDialogStore.exportFormatOverride === "png" ? "png" : ext;
      const defaultName =
        fileName.replace(/\.[^.]+$/, "") + "_edited." + overrideExt;

      const outputPath = await save({
        defaultPath: defaultName,
        filters: isVideo
          ? [{ name: "Video", extensions: [ext] }]
          : [{ name: "Image", extensions: [overrideExt] }],
      });

      if (!outputPath) return;

      editDialogStore.exportFormatOverride = null;

      editing.isExporting = true;
      editDialogStore.exportToast = {
        visible: true,
        phase: "exporting",
        message: "Exporting...",
        outputPath,
      };

      const s = editing.snapshot;
      if (isVideo) {
        if (!videoEl || videoEl.videoWidth <= 0 || videoEl.videoHeight <= 0) {
          throw new Error("Video not ready for export");
        }
        await invokeExportEditedMedia(
          filePath,
          outputPath,
          s,
          videoEl.videoWidth,
          videoEl.videoHeight,
        );
      } else {
        await exportEditedImage(filePath, s, outputPath);
      }

      editing.isExporting = false;
      editDialogStore.exportToast = {
        visible: true,
        phase: "done",
        message: "Exported!",
        outputPath,
      };
    } catch (err) {
      editing.isExporting = false;
      const message =
        err instanceof Error ? err.message : "Failed to export file";
      editDialogStore.exportToast = {
        visible: true,
        phase: "error",
        message,
        outputPath: "",
      };
    }
  }

  async function handleApplyEdits() {
    if (!editing.getHasEdits() && !editing.getCropBounds()) return;
    menuStore.editMenuVisible = false;
    editing.exitCropMode();

    if (needsTransparencyDialog()) {
      editDialogStore.pendingEditAction = "apply";
      editDialogStore.editTransparencyConfirm = true;
      return;
    }

    editDialogStore.editApplyConfirm = true;
  }

  async function handleExportEdits() {
    if (!editing.getHasEdits() && !editing.getCropBounds()) {
      deps.showFrameCopyToast("No edits to export", "info");
      return;
    }

    if (needsTransparencyDialog()) {
      editDialogStore.pendingEditAction = "export";
      editDialogStore.editTransparencyConfirm = true;
      return;
    }

    await performExport();
  }

  async function handleTransparencyChoice(choice: "png" | "keep") {
    editDialogStore.editTransparencyConfirm = false;
    const action = editDialogStore.pendingEditAction;
    editDialogStore.pendingEditAction = null;

    if (choice === "png") {
      editDialogStore.exportFormatOverride = "png";
    } else {
      editDialogStore.exportFormatOverride = null;
    }

    if (action === "apply") {
      editDialogStore.editApplyConfirm = true;
    } else if (action === "export") {
      await performExport();
      editDialogStore.exportFormatOverride = null;
    }
  }

  async function handleApplyConfirm() {
    editDialogStore.editApplyConfirm = false;
    await performApply();
  }

  async function handleApplyExportInstead() {
    editDialogStore.editApplyConfirm = false;
    editDialogStore.exportFormatOverride = null;
    await performExport();
  }

  function closeEditApplyConfirm() {
    editDialogStore.editApplyConfirm = false;
    editDialogStore.exportFormatOverride = null;
  }

  function closeEditTransparencyConfirm() {
    editDialogStore.editTransparencyConfirm = false;
    editDialogStore.pendingEditAction = null;
    editDialogStore.exportFormatOverride = null;
  }

  function handleUndo() {
    editing.undo();
  }

  async function handleReset() {
    await editing.reset();
    deps.showFrameCopyToast("Edits reset", "info");
  }

  return {
    performApply,
    performExport,
    handleApplyEdits,
    handleExportEdits,
    handleTransparencyChoice,
    handleApplyConfirm,
    handleApplyExportInstead,
    closeEditApplyConfirm,
    closeEditTransparencyConfirm,
    handleUndo,
    handleReset,
  };
}
