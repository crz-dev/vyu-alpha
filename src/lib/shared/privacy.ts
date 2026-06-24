const BULLETS = "••••••";

export function obscurePath(filePath: string): string {
  if (!filePath) return filePath;
  const sep = filePath.includes("\\") ? "\\" : "/";
  const parts = filePath.split(sep);
  if (parts.length <= 1) return filePath;
  return `${BULLETS}${sep}${parts[parts.length - 1]}`;
}
