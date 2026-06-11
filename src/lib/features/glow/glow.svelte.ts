import { loadGlow, saveGlow } from "$lib/services/storage";

export type GlowLevel = 0 | 1 | 2 | 3;

function createGlow() {
  const saved = loadGlow() as GlowLevel;
  let level = $state<GlowLevel>(saved);

  function applyGlow(v: GlowLevel) {
    document.documentElement.setAttribute("data-glow-level", String(v));
  }

  if (typeof document !== "undefined") {
    applyGlow(saved);
  }

  function setLevel(v: GlowLevel) {
    level = v;
    saveGlow(v);
    applyGlow(v);
  }

  return {
    get level() {
      return level;
    },
    setLevel,
  };
}

export const glow = createGlow();
