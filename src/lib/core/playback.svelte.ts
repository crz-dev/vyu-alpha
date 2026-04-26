export function createPlaybackActions(
  videoElRef: () => HTMLVideoElement | null,
) {
  function updateProgress(
    set: (data: {
      rawCurrentSecs: number;
      rawDurationSecs: number;
      progress: number;
      playing: boolean;
    }) => void,
  ) {
    const videoEl = videoElRef();
    if (!videoEl) return;

    const rawCurrentSecs = videoEl.currentTime;
    const rawDurationSecs = videoEl.duration || 0;
    const progress =
      rawDurationSecs > 0 ? (rawCurrentSecs / rawDurationSecs) * 100 : 0;

    set({
      rawCurrentSecs,
      rawDurationSecs,
      progress,
      playing: !videoEl.paused,
    });
  }

  function togglePlay() {
    const videoEl = videoElRef();
    if (!videoEl) return;

    videoEl.paused ? videoEl.play() : videoEl.pause();
  }

  function toggleMute(set: (muted: boolean) => void, currentMuted: boolean) {
    const videoEl = videoElRef();
    if (!videoEl) return;

    const next = !currentMuted;
    videoEl.muted = next;
    set(next);
  }

  function setVolume(
    val: number,
    set: (data: { volume: number; muted: boolean }) => void,
  ) {
    const videoEl = videoElRef();
    const volume = Math.max(0, Math.min(1, val));

    if (videoEl) {
      videoEl.volume = volume;
      videoEl.muted = volume === 0;
    }

    set({
      volume,
      muted: volume === 0,
    });
  }

  return {
    updateProgress,
    togglePlay,
    toggleMute,
    setVolume,
  };
}
