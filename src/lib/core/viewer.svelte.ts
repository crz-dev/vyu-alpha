type ViewerState = {
  videoEl: HTMLVideoElement | null;
  isFullscreen: boolean;
  fsControlsVisible: boolean;
  zoomLevel: number;
  translateX: number;
  translateY: number;
  isDragging: boolean;
};

function clampZoom(value: number): number {
  return Math.max(100, Math.min(1000, value));
}

function createViewer() {
  const state = $state<ViewerState>({
    videoEl: null,
    isFullscreen: false,
    fsControlsVisible: true,
    zoomLevel: 100,
    translateX: 0,
    translateY: 0,
    isDragging: false,
  });

  let fsHideTimer: ReturnType<typeof setTimeout> | undefined;
  let lastPinchDist = 0;

  function setVideoEl(el: HTMLVideoElement | null) {
    state.videoEl = el;
  }

  function setDragging(dragging: boolean) {
    state.isDragging = dragging;
  }

  function setTranslation(x: number, y: number) {
    state.translateX = x;
    state.translateY = y;
  }

  function toggleFullscreen() {
    state.isFullscreen = !state.isFullscreen;
    if (state.isFullscreen) resetFsTimer();
  }

  function resetFsTimer() {
    state.fsControlsVisible = true;
    clearTimeout(fsHideTimer);
    fsHideTimer = setTimeout(() => {
      state.fsControlsVisible = false;
    }, 1500);
  }

  function resetZoom() {
    state.zoomLevel = 100;
    state.translateX = 0;
    state.translateY = 0;
  }

  function getPanCursor(): "default" | "grab" | "grabbing" {
    if (state.zoomLevel <= 100) return "default";
    return state.isDragging ? "grabbing" : "grab";
  }

  function getVideoWrapperTransform(): string {
    const scale = state.zoomLevel / 100;
    return `transform: scale(${scale}) translate(${state.translateX / scale}px, ${state.translateY / scale}px); transform-origin: center center;`;
  }

  function handleViewerScroll(e: WheelEvent, fileSrc: string) {
    if (!fileSrc) return;

    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mouseX = e.clientX - rect.left - rect.width / 2;
    const mouseY = e.clientY - rect.top - rect.height / 2;

    const oldScale = state.zoomLevel / 100;
    const raw = state.zoomLevel * (e.deltaY > 0 ? 1 / 1.1 : 1.1);
    const newZoom = clampZoom(state.zoomLevel > 100 && raw < 100 ? 100 : raw);
    const newScale = newZoom / 100;

    if (newZoom === 100) {
      state.translateX = 0;
      state.translateY = 0;
    } else {
      state.translateX =
        mouseX - (mouseX - state.translateX) * (newScale / oldScale);
      state.translateY =
        mouseY - (mouseY - state.translateY) * (newScale / oldScale);
    }

    state.zoomLevel = newZoom;
  }

  function handleTouchZoom(e: TouchEvent) {
    if (e.touches.length !== 2) return;

    e.preventDefault();

    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (lastPinchDist === 0) {
      lastPinchDist = dist;
      return;
    }

    state.zoomLevel = clampZoom(state.zoomLevel * (dist / lastPinchDist));
    lastPinchDist = dist;
  }

  function handleTouchEnd() {
    lastPinchDist = 0;
  }

  return {
    state,
    setVideoEl,
    setDragging,
    setTranslation,
    toggleFullscreen,
    resetFsTimer,
    resetZoom,
    getPanCursor,
    getVideoWrapperTransform,
    handleViewerScroll,
    handleTouchZoom,
    handleTouchEnd,
  };
}

export const viewer = createViewer();
