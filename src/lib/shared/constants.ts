export const IMAGE_EXTS = ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"];
export const VIDEO_EXTS = ["mp4", "webm", "mkv", "avi", "mov", "wmv"];
export const AUDIO_EXTS = ["mp3", "wav", "flac", "ogg", "aac", "wma", "m4a", "opus"];
export const ALL_EXTS = [...IMAGE_EXTS, ...VIDEO_EXTS, ...AUDIO_EXTS];
export const VOLUME_SEGMENTS = 8;
export const LOOP_MODES = ["loop", "stop", "next", "shuffle"] as const;
export type LoopMode = (typeof LOOP_MODES)[number];
