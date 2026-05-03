import { readDir } from "@tauri-apps/plugin-fs";
import { ALL_EXTS } from "$lib/constants";

const folderCache = new Map<string, string[]>();

export async function readMediaFilesInFolder(path: string): Promise<string[]> {
  const sep = path.includes("\\") ? "\\" : "/";
  const folder = path.substring(0, path.lastIndexOf(sep));
  const cached = folderCache.get(folder);
  if (cached) return cached;
  const entries = await readDir(folder);
  const list = entries
    .filter((e) =>
      ALL_EXTS.includes(e.name?.split(".").pop()?.toLowerCase() ?? ""),
    )
    .map((e) => `${folder}${sep}${e.name}`)
    .sort();
  folderCache.set(folder, list);
  return list;
}

export function clearFolderCache(folder?: string) {
  if (folder) {
    folderCache.delete(folder);
  } else {
    folderCache.clear();
  }
}

export function getParentFolder(filePath: string): string {
  const sep = filePath.includes("\\") ? "\\" : "/";
  return filePath.includes(sep)
    ? filePath.substring(0, filePath.lastIndexOf(sep))
    : "";
}

export function getFileExt(filePath: string): string {
  return filePath.split(".").pop()?.toLowerCase() || "";
}

export function getFileName(filePath: string): string {
  return filePath.split("\\").pop()?.split("/").pop() || filePath;
}
