import type { CtxMenu } from "$lib/types";

export function computeContextMenuPosition(
  clientX: number,
  clientY: number,
  menuWidth: number,
  menuHeight: number,
): Pick<CtxMenu, "x" | "y"> {
  let x = clientX;
  let y = clientY;
  if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 8;
  if (y + menuHeight > window.innerHeight)
    y = window.innerHeight - menuHeight - 8;
  return { x, y };
}

export function showFloatingTooltip(
  id: string,
  anchorRect: DOMRect,
  text: string,
): void {
  const tip = document.getElementById(id);
  if (!tip) return;
  tip.textContent = text;
  tip.style.left = `${anchorRect.left}px`;
  tip.style.top = `${anchorRect.bottom + 6}px`;
  tip.style.opacity = "1";
}

export function hideFloatingTooltip(id: string): void {
  const tip = document.getElementById(id);
  if (tip) tip.style.opacity = "0";
}
