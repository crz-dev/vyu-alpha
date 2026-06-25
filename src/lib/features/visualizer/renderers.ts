// Canvas renderers for the four visualizer types
// All functions are pure — they receive canvas context and data, draw, return nothing.

const GRADIENT_STOPS: [number, string][] = [
  [0, "#ff4444"],
  [0.2, "#ff8800"],
  [0.4, "#ffcc00"],
  [0.6, "#00cc66"],
  [0.8, "#00aaff"],
  [1, "#aa44ff"],
];

// Logarithmic frequency bin mapping — spreads bins across 20Hz–20kHz
function getLogIndex(i: number, total: number, bufferLength: number): number {
  const logMin = Math.log10(20);
  const logMax = Math.log10(20000);
  const logFreq = logMin + (i / total) * (logMax - logMin);
  return Math.min(
    bufferLength - 1,
    Math.floor((Math.pow(10, logFreq) / 20000) * bufferLength),
  );
}

export function createWarmToCoolGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
): CanvasGradient {
  const g = ctx.createLinearGradient(0, 0, width, 0);
  for (const [offset, color] of GRADIENT_STOPS) {
    g.addColorStop(offset, color);
  }
  return g;
}

function colorForPosition(t: number): string {
  const stops = GRADIENT_STOPS;
  for (let i = 1; i < stops.length; i++) {
    if (t <= stops[i][0]) {
      const local = (t - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]);
      return lerpColor(stops[i - 1][1], stops[i][1], local);
    }
  }
  return stops[stops.length - 1][1];
}

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bl = Math.round(ab + (bb - ab) * t);
  return `rgb(${r},${g},${bl})`;
}

// ── Bars ───────────────────────────────────────────────────────────────

const BAR_COUNT = 80;
const BAR_GAP = 2;

export interface BarsState {
  peaks: number[];
  peakVel: number[];
}

export function createBarsState(): BarsState {
  return {
    peaks: new Array(BAR_COUNT).fill(0),
    peakVel: new Array(BAR_COUNT).fill(0),
  };
}

export function drawBars(
  ctx: CanvasRenderingContext2D,
  freqData: Uint8Array,
  w: number,
  h: number,
  state: BarsState,
): void {
  ctx.clearRect(0, 0, w, h);

  const totalGap = BAR_GAP * (BAR_COUNT - 1);
  const barWidth = (w - totalGap) / BAR_COUNT;
  const gradient = createWarmToCoolGradient(ctx, w);

  // Reflection pass (drawn first, behind main bars)
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.translate(0, h);
  ctx.scale(1, -1);
  for (let i = 0; i < BAR_COUNT; i++) {
    const binIdx = getLogIndex(i, BAR_COUNT, freqData.length);
    const value = freqData[binIdx] ?? 0;
    const barHeight = Math.max(2, (value / 255) * h * 0.4);
    const x = i * (barWidth + BAR_GAP);
    const y = 0;
    const radius = Math.min(barWidth / 2, 3);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + barHeight - radius);
    ctx.arcTo(x, y + barHeight, x + radius, y + barHeight, radius);
    ctx.arcTo(
      x + barWidth,
      y + barHeight,
      x + barWidth,
      y + barHeight - radius,
      radius,
    );
    ctx.lineTo(x + barWidth, y);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  // Main bars
  for (let i = 0; i < BAR_COUNT; i++) {
    const binIdx = getLogIndex(i, BAR_COUNT, freqData.length);
    const value = freqData[binIdx] ?? 0;
    const barHeight = Math.max(2, (value / 255) * h);
    const x = i * (barWidth + BAR_GAP);
    const y = h - barHeight;
    const radius = Math.min(barWidth / 2, 3);

    // Peak tracking with gravity
    if (barHeight > state.peaks[i]) {
      state.peaks[i] = barHeight;
      state.peakVel[i] = 0;
    } else {
      state.peakVel[i] += 0.15;
      state.peaks[i] = Math.max(0, state.peaks[i] - state.peakVel[i]);
    }

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.arcTo(x + barWidth, y, x + barWidth, y + radius, radius);
    ctx.lineTo(x + barWidth, h);
    ctx.closePath();
    ctx.fill();

    // Peak dot
    const peakY = h - state.peaks[i];
    if (state.peaks[i] > 2) {
      ctx.fillStyle = "#ffffff";
      ctx.globalAlpha = 0.9;
      ctx.fillRect(x, peakY - 1, barWidth, 2);
      ctx.globalAlpha = 1;
    }
  }
}

// ── Spectrum ───────────────────────────────────────────────────────────

export function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  freqData: Uint8Array,
  w: number,
  h: number,
): void {
  ctx.clearRect(0, 0, w, h);

  const points = 80;

  // Log-mapped + rolling average smoothed coordinates
  const coords: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const binIdx = getLogIndex(i, points, freqData.length);
    const lo = Math.max(0, binIdx - 1);
    const hi = Math.min(freqData.length - 1, binIdx + 1);
    const smoothed = (freqData[lo] + freqData[binIdx] + freqData[hi]) / 3;
    const x = (i / (points - 1)) * w;
    const y = h - (smoothed / 255) * h * 0.9;
    coords.push([x, y]);
  }

  const gradient = createWarmToCoolGradient(ctx, w);

  // Build the bezier path once
  function tracePath() {
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let i = 0; i < coords.length; i++) {
      const [x, y] = coords[i];
      if (i === 0) {
        ctx.lineTo(x, y);
      } else {
        const [px, py] = coords[i - 1];
        const cpx = (px + x) / 2;
        ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
      }
    }
    ctx.lineTo(w, h);
    ctx.closePath();
  }

  // Fill — dual gradient: left-right color + bottom-top opacity fade
  tracePath();
  const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
  fillGrad.addColorStop(0, "rgba(0,0,0,0)");
  fillGrad.addColorStop(1, "rgba(0,0,0,0.4)");
  ctx.fillStyle = gradient;
  ctx.globalAlpha = 0.4;
  ctx.fill();
  ctx.fillStyle = fillGrad;
  ctx.globalAlpha = 0.3;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Stroke — glow pass (wide + faint)
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    if (i === 0) {
      ctx.lineTo(x, y);
    } else {
      const [px, py] = coords[i - 1];
      const cpx = (px + x) / 2;
      ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
    }
  }
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 6;
  ctx.globalAlpha = 0.2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Stroke — main pass
  ctx.beginPath();
  ctx.moveTo(0, h);
  for (let i = 0; i < coords.length; i++) {
    const [x, y] = coords[i];
    if (i === 0) {
      ctx.lineTo(x, y);
    } else {
      const [px, py] = coords[i - 1];
      const cpx = (px + x) / 2;
      ctx.bezierCurveTo(cpx, py, cpx, y, x, y);
    }
  }
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 1;
  ctx.stroke();
}

// ── Scope ──────────────────────────────────────────────────────────────

export function drawScope(
  ctx: CanvasRenderingContext2D,
  timeData: Uint8Array,
  w: number,
  h: number,
): void {
  ctx.clearRect(0, 0, w, h);

  const gradient = createWarmToCoolGradient(ctx, w);

  // Grid lines at 25%, 50%, 75%
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;
  for (const frac of [0.25, 0.5, 0.75]) {
    ctx.beginPath();
    ctx.moveTo(0, h * frac);
    ctx.lineTo(w, h * frac);
    ctx.stroke();
  }

  // Build waveform path
  function traceWave() {
    ctx.beginPath();
    for (let i = 0; i < timeData.length; i++) {
      const x = (i / (timeData.length - 1)) * w;
      const y = (timeData[i] / 255) * h;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
  }

  // Glow pass
  traceWave();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 6;
  ctx.globalAlpha = 0.2;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Main pass
  traceWave();
  ctx.lineWidth = 2;
  ctx.globalAlpha = 1;
  ctx.stroke();
}

// ── Particles ──────────────────────────────────────────────────────────

export interface Particle {
  x: number;
  y: number;
  baseX: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
  frequencyBin: number;
  sineOffset: number;
  sineSpeed: number;
  isSquare: boolean;
}

export function createParticles(count: number, binCount: number): Particle[] {
  // Distribute particles into 4 equal bands so all frequency ranges are represented
  const bandSize = Math.floor(count / 4);
  return Array.from({ length: count }, (_, i) => {
    const band = Math.min(3, Math.floor(i / bandSize));
    const bandStart = Math.floor((band / 4) * binCount);
    const bandEnd = Math.floor(((band + 1) / 4) * binCount);
    const bin = bandStart + Math.floor(Math.random() * (bandEnd - bandStart));
    const t = bin / binCount;
    return {
      x: Math.random(),
      y: Math.random(),
      baseX: Math.random(),
      size: 2 + Math.random() * 3,
      speed: 0.002 + Math.random() * 0.003,
      opacity: 0.6 + Math.random() * 0.4,
      color: colorForPosition(t),
      frequencyBin: bin,
      sineOffset: Math.random() * Math.PI * 2,
      sineSpeed: 0.5 + Math.random() * 1.5,
      isSquare: Math.random() > 0.8,
    };
  });
}

export function drawParticles(
  ctx: CanvasRenderingContext2D,
  freqData: Uint8Array,
  w: number,
  h: number,
  particles: Particle[],
  time: number,
): void {
  ctx.clearRect(0, 0, w, h);

  // Overall energy for silence detection
  let totalEnergy = 0;
  for (let i = 0; i < freqData.length; i += 8) {
    totalEnergy += freqData[i];
  }
  const avgEnergy = totalEnergy / (freqData.length / 8);
  const isSilent = avgEnergy < 15;

  for (const p of particles) {
    const value = freqData[p.frequencyBin] ?? 0;
    const intensity = value / 255;

    // Size driven by frequency
    const renderSize = p.size * (0.5 + intensity * 1.5);

    // Speed driven by frequency (slower in silence)
    const speed = p.speed * (isSilent ? 0.3 : 0.3 + intensity * 2);

    // Update position
    p.y -= speed;
    if (p.y < -0.05) {
      p.y = 1.05;
      p.baseX = Math.random();
    }

    // Horizontal drift via sine
    const drift = Math.sin(time * p.sineSpeed + p.sineOffset) * 0.03;
    p.x = p.baseX + drift;

    // Opacity: quiet bins fade to 0.1, silence keeps low ambient opacity
    const alpha = isSilent
      ? 0.08 + Math.sin(time * 0.5 + p.sineOffset) * 0.04
      : value < 30
        ? 0.1
        : 0.1 + intensity * 0.9;

    const cx = p.x * w;
    const cy = p.y * h;

    // Soft glow
    ctx.globalAlpha = alpha * p.opacity * 0.2;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(cx, cy, renderSize * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Main particle
    ctx.globalAlpha = alpha * p.opacity;
    ctx.fillStyle = p.color;
    if (p.isSquare) {
      ctx.fillRect(
        cx - renderSize * 0.7,
        cy - renderSize * 0.7,
        renderSize * 1.4,
        renderSize * 1.4,
      );
    } else {
      ctx.beginPath();
      ctx.arc(cx, cy, renderSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
