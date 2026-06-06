import { convertFileSrc } from "@tauri-apps/api/core";
import { invokeExtractCoverArt } from "$lib/features/media/tools";
import { CD_COLORS } from "$lib/shared/constants";
import { loadCdColor, saveCdColor } from "$lib/services/storage";

export interface CdColorSetters {
  setCdColor: (v: string) => void;
  setCdColorIndex: (v: number) => void;
  setCoverArtSrc: (v: string) => void;
}

export function loadCdColorForFile(filePath: string, setters: CdColorSetters) {
  const idx = loadCdColor(filePath);
  if (idx >= 0 && idx < CD_COLORS.length) {
    setters.setCdColorIndex(idx);
    setters.setCdColor(CD_COLORS[idx]);
  } else {
    const rand = Math.floor(Math.random() * CD_COLORS.length);
    saveCdColor(filePath, rand);
    setters.setCdColorIndex(rand);
    setters.setCdColor(CD_COLORS[rand]);
  }
  invokeExtractCoverArt(filePath)
    .then((coverPath) => {
      setters.setCoverArtSrc(coverPath ? convertFileSrc(coverPath) : "");
    })
    .catch(() => {
      setters.setCoverArtSrc("");
    });
}
