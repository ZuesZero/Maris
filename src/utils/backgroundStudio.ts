export type StudioBgPresetId =
  | 'pure-white'
  | 'studio-daylight'
  | 'studio-floor'
  | 'warm-alabaster'
  | 'atelier-cream'
  | 'pearl-grey';

export interface StudioBgOptions {
  preset: StudioBgPresetId;
  customHex?: string;
  tolerance?: number; // 15 to 90, default 52
  addStudioShadow?: boolean;
  enhanceGarmentLight?: boolean;
  extraSamplePoints?: Array<{ xNorm: number; yNorm: number }>;
}

export interface StudioBgPreset {
  id: StudioBgPresetId;
  nameEn: string;
  nameEs: string;
  previewBg: string;
  badgeEn?: string;
  badgeEs?: string;
}

export const STUDIO_BG_PRESETS: StudioBgPreset[] = [
  {
    id: 'pure-white',
    nameEn: 'Pure White (Photoroom)',
    nameEs: 'Blanco Puro (Photoroom)',
    previewBg: '#FFFFFF',
    badgeEn: 'Photoroom',
    badgeEs: 'Photoroom',
  },
  {
    id: 'studio-floor',
    nameEn: 'White Studio + Floor',
    nameEs: 'Estudio Blanco + Piso',
    previewBg: 'linear-gradient(180deg, #FFFFFF 75%, #EAEAEA 100%)',
  },
  {
    id: 'studio-daylight',
    nameEn: 'Soft Daylight White',
    nameEs: 'Luz de Día Suave',
    previewBg: 'radial-gradient(circle, #FFFFFF 55%, #F0EFEA 100%)',
  },
  {
    id: 'warm-alabaster',
    nameEn: 'Warm Alabaster',
    nameEs: 'Alabastro Cálido',
    previewBg: '#FAF8F5',
  },
  {
    id: 'atelier-cream',
    nameEn: 'Atelier Ivory',
    nameEs: 'Marfil Atelier',
    previewBg: '#F4F0EA',
  },
  {
    id: 'pearl-grey',
    nameEn: 'Pearl Studio Grey',
    nameEs: 'Gris Perla Estudio',
    previewBg: '#EFEFF1',
  },
];

// Singleton ONNX Runtime session & per-image neural mask cache
let isnetSessionPromise: Promise<any> | null = null;
const neuralMaskCache = new Map<
  string,
  { w: number; h: number; mask: Float32Array }
>();

async function getIsnetSession(): Promise<{ ort: any; session: any }> {
  if (!isnetSessionPromise) {
    isnetSessionPromise = (async () => {
      const dynamicImport = new Function('url', 'return import(url)');
      const ortUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/ort-wasm/ort.wasm.min.mjs`
          : '/ort-wasm/ort.wasm.min.mjs';
      const ortModule = await dynamicImport(ortUrl);
      const ort = ortModule.default || ortModule;

      ort.env.wasm.numThreads = 1;
      ort.env.wasm.simd = true;
      ort.env.wasm.proxy = false;
      if (typeof window !== 'undefined') {
        ort.env.wasm.wasmPaths = `${window.location.origin}/ort-wasm/`;
      }

      let modelArrayBuffer: ArrayBuffer | null = null;
      try {
        const res = await fetch('/api/isnet-model');
        if (res.ok) {
          modelArrayBuffer = await res.arrayBuffer();
        }
      } catch {
        // Fallback to direct CDN chunks if local proxy unavailable
      }

      if (!modelArrayBuffer) {
        const baseUrl =
          'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.4.5/dist/';
        const metaRes = await fetch(`${baseUrl}metadata.json`);
        const meta = await metaRes.json();
        const modelInfo = meta['isnet_quint8'] || meta['isnet_fp16'];
        const chunks: string[] = modelInfo.chunks;
        const buffers = await Promise.all(
          chunks.map(async (c) => {
            const r = await fetch(`${baseUrl}${c}`);
            return r.arrayBuffer();
          })
        );
        const totalLen = buffers.reduce((acc, b) => acc + b.byteLength, 0);
        const combined = new Uint8Array(totalLen);
        let offset = 0;
        for (const b of buffers) {
          combined.set(new Uint8Array(b), offset);
          offset += b.byteLength;
        }
        modelArrayBuffer = combined.buffer;
      }

      const session = await ort.InferenceSession.create(modelArrayBuffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
      return { ort, session };
    })().catch((err) => {
      isnetSessionPromise = null;
      throw err;
    });
  }
  return isnetSessionPromise;
}

async function computeIsnetMask(
  img: HTMLImageElement,
  w: number,
  h: number,
  cacheKey: string
): Promise<Float32Array | null> {
  const cached = neuralMaskCache.get(cacheKey);
  if (cached && cached.w === w && cached.h === h) {
    return cached.mask;
  }

  try {
    const { ort, session } = await getIsnetSession();
    const modelSize = 1024;
    const netCanvas = document.createElement('canvas');
    netCanvas.width = modelSize;
    netCanvas.height = modelSize;
    const netCtx = netCanvas.getContext('2d', { willReadFrequently: true });
    if (!netCtx) return null;

    netCtx.drawImage(img, 0, 0, modelSize, modelSize);
    const netData = netCtx.getImageData(0, 0, modelSize, modelSize).data;

    const planeSize = modelSize * modelSize;
    const floatInput = new Float32Array(3 * planeSize);
    for (let i = 0; i < planeSize; i++) {
      const p = i * 4;
      floatInput[i] = (netData[p] / 255.0 - 0.5) / 1.0;
      floatInput[planeSize + i] = (netData[p + 1] / 255.0 - 0.5) / 1.0;
      floatInput[2 * planeSize + i] = (netData[p + 2] / 255.0 - 0.5) / 1.0;
    }

    const inputName = session.inputNames[0];
    const inputTensor = new ort.Tensor('float32', floatInput, [
      1,
      3,
      modelSize,
      modelSize,
    ]);
    const results = await session.run({ [inputName]: inputTensor });
    const outputName = session.outputNames[0];
    const rawMask = results[outputName].data as Float32Array;

    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let i = 0; i < planeSize; i++) {
      const v = rawMask[i];
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    }
    const range = Math.max(1e-5, maxVal - minVal);

    const mask = new Float32Array(w * h);
    const scaleX = (modelSize - 1) / Math.max(1, w - 1);
    const scaleY = (modelSize - 1) / Math.max(1, h - 1);

    for (let y = 0; y < h; y++) {
      const sy = y * scaleY;
      const y0 = Math.floor(sy);
      const y1 = Math.min(modelSize - 1, y0 + 1);
      const fy = sy - y0;
      const row0 = y0 * modelSize;
      const row1 = y1 * modelSize;

      for (let x = 0; x < w; x++) {
        const sx = x * scaleX;
        const x0 = Math.floor(sx);
        const x1 = Math.min(modelSize - 1, x0 + 1);
        const fx = sx - x0;

        const v00 = (rawMask[row0 + x0] - minVal) / range;
        const v10 = (rawMask[row0 + x1] - minVal) / range;
        const v01 = (rawMask[row1 + x0] - minVal) / range;
        const v11 = (rawMask[row1 + x1] - minVal) / range;

        const top = v00 + (v10 - v00) * fx;
        const bot = v01 + (v11 - v01) * fx;
        mask[y * w + x] = Math.max(0, Math.min(1, top + (bot - top) * fy));
      }
    }

    if (neuralMaskCache.size >= 8) {
      const firstKey = neuralMaskCache.keys().next().value;
      if (firstKey) neuralMaskCache.delete(firstKey);
    }
    neuralMaskCache.set(cacheKey, { w, h, mask });
    return mask;
  } catch (err) {
    console.warn('IS-Net segmentation fallback to edge-guided studio segmentation:', err);
    return null;
  }
}

function pixelLum(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function pixelSat(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min;
}

function perceptualColorDist(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number
): number {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  const dl = 0.299 * dr + 0.587 * dg + 0.114 * db;
  const ds = pixelSat(r1, g1, b1) - pixelSat(r2, g2, b2);
  return Math.sqrt(dr * dr + dg * dg + db * db + dl * dl * 1.2 + ds * ds * 0.8);
}

/**
 * O(1) Sliding-Window Multi-Pass Box/Gaussian Filter.
 */
function multiPassGaussianFilter(
  field: Float32Array,
  w: number,
  h: number,
  r: number,
  passes: number
): Float32Array {
  let src = new Float32Array(field);
  const tmp = new Float32Array(w * h);
  const dst = new Float32Array(w * h);

  for (let pass = 0; pass < passes; pass++) {
    for (let y = 0; y < h; y++) {
      const row = y * w;
      let sum = 0;
      let cnt = 0;
      for (let x = 0; x <= Math.min(w - 1, r); x++) {
        sum += src[row + x];
        cnt++;
      }
      for (let x = 0; x < w; x++) {
        tmp[row + x] = sum / cnt;
        const rem = x - r;
        const add = x + r + 1;
        if (rem >= 0) {
          sum -= src[row + rem];
          cnt--;
        }
        if (add < w) {
          sum += src[row + add];
          cnt++;
        }
      }
    }

    for (let x = 0; x < w; x++) {
      let sum = 0;
      let cnt = 0;
      for (let y = 0; y <= Math.min(h - 1, r); y++) {
        sum += tmp[y * w + x];
        cnt++;
      }
      for (let y = 0; y < h; y++) {
        dst[y * w + x] = sum / cnt;
        const rem = y - r;
        const add = y + r + 1;
        if (rem >= 0) {
          sum -= tmp[rem * w + x];
          cnt--;
        }
        if (add < h) {
          sum += tmp[(add < h ? add : h - 1) * w + x];
          cnt++;
        }
      }
    }

    if (pass < passes - 1) {
      src.set(dst);
    }
  }

  return dst;
}

/**
 * Keeps only the Largest Connected Component (and any major central component >= 5% of main area)
 * while wiping 100% of floating clouds/islands outside the item to 0.
 */
function filterLargestConnectedComponents(
  fgMask: Uint8Array,
  w: number,
  h: number
): void {
  const visited = new Uint8Array(w * h);
  const compQueue = new Int32Array(w * h);
  const comps: Array<{ pixels: Int32Array; touchesCenter: boolean }> = [];
  let maxArea = 0;
  let mainIdx = -1;

  const cMinX = Math.floor(w * 0.22);
  const cMaxX = Math.ceil(w * 0.78);
  const cMinY = Math.floor(h * 0.12);
  const cMaxY = Math.ceil(h * 0.88);
  const nxOff = [-1, 1, 0, 0, -1, 1, -1, 1];
  const nyOff = [0, 0, -1, 1, -1, -1, 1, 1];

  for (let i = 0; i < w * h; i++) {
    if (!fgMask[i] || visited[i]) continue;
    let head = 0;
    let tail = 0;
    visited[i] = 1;
    compQueue[tail++] = i;
    let touchesCenter = false;

    while (head < tail) {
      const curr = compQueue[head++];
      const cy = Math.floor(curr / w);
      const cx = curr - cy * w;
      if (cx >= cMinX && cx <= cMaxX && cy >= cMinY && cy <= cMaxY) {
        touchesCenter = true;
      }
      for (let k = 0; k < 8; k++) {
        const nx = cx + nxOff[k];
        const ny = cy + nyOff[k];
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const nIdx = ny * w + nx;
        if (fgMask[nIdx] && !visited[nIdx]) {
          visited[nIdx] = 1;
          compQueue[tail++] = nIdx;
        }
      }
    }

    const px = compQueue.slice(0, tail);
    if (px.length > maxArea) {
      maxArea = px.length;
      mainIdx = comps.length;
    }
    comps.push({ pixels: px, touchesCenter });
  }

  for (let c = 0; c < comps.length; c++) {
    if (c === mainIdx) continue;
    if (!comps[c].touchesCenter || comps[c].pixels.length < maxArea * 0.05) {
      const px = comps[c].pixels;
      for (let j = 0; j < px.length; j++) {
        fgMask[px[j]] = 0;
      }
    }
  }
}

/**
 * Removes any disconnected floating islands from a continuous alpha map (`finalAlpha`)
 * that may have pinched off during SDF smoothing, guaranteeing 100% pure white outside the main item.
 */
function filterAlphaConnectedComponents(
  finalAlpha: Float32Array,
  w: number,
  h: number
): void {
  const visited = new Uint8Array(w * h);
  const compQueue = new Int32Array(w * h);
  const comps: Array<{ pixels: Int32Array; touchesCenter: boolean }> = [];
  let maxArea = 0;
  let mainIdx = -1;

  const cMinX = Math.floor(w * 0.22);
  const cMaxX = Math.ceil(w * 0.78);
  const cMinY = Math.floor(h * 0.12);
  const cMaxY = Math.ceil(h * 0.88);
  const nxOff = [-1, 1, 0, 0, -1, 1, -1, 1];
  const nyOff = [0, 0, -1, 1, -1, -1, 1, 1];

  for (let i = 0; i < w * h; i++) {
    if (finalAlpha[i] <= 0.005 || visited[i]) continue;
    let head = 0;
    let tail = 0;
    visited[i] = 1;
    compQueue[tail++] = i;
    let touchesCenter = false;

    while (head < tail) {
      const curr = compQueue[head++];
      const cy = Math.floor(curr / w);
      const cx = curr - cy * w;
      if (cx >= cMinX && cx <= cMaxX && cy >= cMinY && cy <= cMaxY) {
        touchesCenter = true;
      }
      for (let k = 0; k < 8; k++) {
        const nx = cx + nxOff[k];
        const ny = cy + nyOff[k];
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const nIdx = ny * w + nx;
        if (finalAlpha[nIdx] > 0.005 && !visited[nIdx]) {
          visited[nIdx] = 1;
          compQueue[tail++] = nIdx;
        }
      }
    }

    const px = compQueue.slice(0, tail);
    if (px.length > maxArea) {
      maxArea = px.length;
      mainIdx = comps.length;
    }
    comps.push({ pixels: px, touchesCenter });
  }

  for (let c = 0; c < comps.length; c++) {
    if (c === mainIdx) continue;
    if (!comps[c].touchesCenter || comps[c].pixels.length < maxArea * 0.05) {
      const px = comps[c].pixels;
      for (let j = 0; j < px.length; j++) {
        finalAlpha[px[j]] = 0.0;
      }
    }
  }
}

/**
 * Prunes thin peripheral border strips/clutter clinging to the left/right edges of the frame
 * while preserving the main cloth/garment body.
 */
function prunePeripheralBorderStrips(
  fgMask: Uint8Array,
  w: number,
  h: number
): void {
  const leftZoneLimit = Math.floor(w * 0.11);
  const rightZoneStart = Math.ceil(w * 0.89);
  const maxStripWidth = Math.max(22, Math.floor(w * 0.055));

  for (let y = 0; y < h; y++) {
    const row = y * w;

    let totalRowFg = 0;
    for (let x = 0; x < w; x++) {
      if (fgMask[row + x]) totalRowFg++;
    }
    if (totalRowFg === 0) continue;

    let x = 0;
    while (x < leftZoneLimit) {
      while (x < leftZoneLimit && !fgMask[row + x]) x++;
      if (x >= leftZoneLimit) break;
      const runStart = x;
      while (x < w && fgMask[row + x]) x++;
      const runEnd = x;
      const runWidth = runEnd - runStart;

      if (
        runEnd <= leftZoneLimit + 8 &&
        runWidth <= maxStripWidth &&
        totalRowFg > runWidth * 2.5
      ) {
        for (let k = runStart; k < runEnd; k++) {
          fgMask[row + k] = 0;
        }
      }
    }

    x = rightZoneStart;
    while (x < w) {
      while (x < w && !fgMask[row + x]) x++;
      if (x >= w) break;
      const runStart = x;
      while (x < w && fgMask[row + x]) x++;
      const runEnd = x;
      const runWidth = runEnd - runStart;

      if (
        runStart >= rightZoneStart - 8 &&
        runWidth <= maxStripWidth &&
        totalRowFg > runWidth * 2.5
      ) {
        for (let k = runStart; k < runEnd; k++) {
          fgMask[row + k] = 0;
        }
      }
    }
  }
}

/**
 * Photoroom Studio Cutout Engine — Natural Optical Lens Matting (Zero "Scissor-Cut" Harshness):
 * 1. Continuous Sub-Pixel Neural Contour Preservation: Uses IS-Net's continuous sub-pixel probabilities inside the cleaned
 *    foreground support so facial profiles (nose, lips, chin), hair curls, and tattooed forearms never get quantized into polygonal steps.
 * 2. Gentle Curve-Preserving SDF + Natural Optical Alpha Roll-Off (`halfBand = 0.11`):
 *    - Smooths gentle curves and organic contours (nose, chin, elbows, forearms) with `sdfSmooth` while only locking sharp 90-degree
 *      garment junctions (`|sdfSmooth - sdfFine| > 0.13`) so there is neither corner webbing nor polygonal "scissor-cut" faceting.
 * 3. Proportional Sub-Pixel Edge Unmixing (Stage 7):
 *    - Preserves 100% of original interior texture and natural cylindrical shading right up to the edge, applying gentle proportional
 *      decontamination only on semi-transparent feathered edge pixels (`a < 0.96`) or true grey backdrop halos.
 */
export async function processProfessionalBackground(
  imageSrc: string,
  options: StudioBgOptions
): Promise<string> {
  const {
    preset = 'pure-white',
    customHex,
    tolerance = 52,
    extraSamplePoints = [],
  } = options;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = (err) => reject(err);
    img.src = imageSrc;
  });

  const minLongEdge = 1150;
  const maxLongEdge = 1350;
  let w = img.naturalWidth || img.width || 800;
  let h = img.naturalHeight || img.height || 1000;
  const currentLongEdge = Math.max(w, h);

  if (currentLongEdge < minLongEdge) {
    const scale = minLongEdge / currentLongEdge;
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  } else if (currentLongEdge > maxLongEdge) {
    const scale = maxLongEdge / currentLongEdge;
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true });
  if (!srcCtx) throw new Error('Canvas 2D context unavailable');
  srcCtx.imageSmoothingEnabled = true;
  srcCtx.imageSmoothingQuality = 'high';
  srcCtx.drawImage(img, 0, 0, w, h);

  const imgData = srcCtx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const origRgb = new Uint8ClampedArray(data);

  // Stage 1: Outer Background Color Model from Borders + User Sample Points
  const bgCentroids: Array<{
    r: number;
    g: number;
    b: number;
    lum: number;
    sat: number;
    count: number;
  }> = [];

  const addBgSample = (r: number, g: number, b: number, weight = 1) => {
    const lum = pixelLum(r, g, b);
    const sat = pixelSat(r, g, b);
    for (const c of bgCentroids) {
      if (perceptualColorDist(r, g, b, c.r, c.g, c.b) < 18) {
        const total = c.count + weight;
        c.r = (c.r * c.count + r * weight) / total;
        c.g = (c.g * c.count + g * weight) / total;
        c.b = (c.b * c.count + b * weight) / total;
        c.lum = pixelLum(c.r, c.g, c.b);
        c.sat = pixelSat(c.r, c.g, c.b);
        c.count = total;
        return;
      }
    }
    bgCentroids.push({ r, g, b, lum, sat, count: weight });
  };

  const borderStep = Math.max(2, Math.floor(Math.min(w, h) / 90));
  const margin = Math.max(2, Math.floor(Math.min(w, h) * 0.01));

  for (let x = margin; x < w - margin; x += borderStep) {
    if (x < w * 0.25 || x > w * 0.75) {
      const pTop = (margin * w + x) * 4;
      addBgSample(origRgb[pTop], origRgb[pTop + 1], origRgb[pTop + 2]);
      const pBot = ((h - 1 - margin) * w + x) * 4;
      addBgSample(origRgb[pBot], origRgb[pBot + 1], origRgb[pBot + 2]);
    }
  }
  for (let y = margin; y < h - margin; y += borderStep) {
    const pL = (y * w + margin) * 4;
    addBgSample(origRgb[pL], origRgb[pL + 1], origRgb[pL + 2], 2);
    const pR = (y * w + (w - 1 - margin)) * 4;
    addBgSample(origRgb[pR], origRgb[pR + 1], origRgb[pR + 2], 2);
  }

  for (const pt of extraSamplePoints) {
    const sx = Math.max(0, Math.min(w - 1, Math.round(pt.xNorm * w)));
    const sy = Math.max(0, Math.min(h - 1, Math.round(pt.yNorm * h)));
    for (let dy = -3; dy <= 3; dy += 2) {
      for (let dx = -3; dx <= 3; dx += 2) {
        const nx = Math.max(0, Math.min(w - 1, sx + dx));
        const ny = Math.max(0, Math.min(h - 1, sy + dy));
        const p = (ny * w + nx) * 4;
        addBgSample(origRgb[p], origRgb[p + 1], origRgb[p + 2], 12);
      }
    }
  }

  bgCentroids.sort((a, b) => b.count - a.count);
  const topCentroids = bgCentroids.slice(0, 12);

  let totalWeight = 0;
  let meanBgLum = 235;
  let meanBgSat = 8;
  let lumSum = 0,
    satSum = 0;
  for (const c of topCentroids) {
    lumSum += c.lum * c.count;
    satSum += c.sat * c.count;
    totalWeight += c.count;
  }
  if (totalWeight > 0) {
    meanBgLum = lumSum / totalWeight;
    meanBgSat = satSum / totalWeight;
  }
  const isLightNeutralBg = meanBgLum > 155 && meanBgSat < 32;

  const minBgDist = (r: number, g: number, b: number): number => {
    let best = 9999;
    for (let i = 0; i < topCentroids.length; i++) {
      const c = topCentroids[i];
      const d = perceptualColorDist(r, g, b, c.r, c.g, c.b);
      if (d < best) best = d;
    }
    if (isLightNeutralBg) {
      const lum = pixelLum(r, g, b);
      const sat = pixelSat(r, g, b);
      if (lum > 140 && Math.abs(lum - meanBgLum) <= 55 && sat <= Math.max(16, meanBgSat + 9)) {
        const neutralDist = Math.abs(lum - meanBgLum) * 0.55 + sat * 1.3;
        if (neutralDist < best) best = neutralDist;
      }
    }
    return best;
  };

  /**
   * Protects central human skin, facial profiles (nose/lips/chin), and tattooed forearm tones
   * while never protecting warm background clutter near the outer frame borders (x < 12% or x > 88%)
   * or low-saturation grey studio shadows in neck/sleeve corners.
   */
  const isCentralHumanSkinOrTattoo = (
    r: number,
    g: number,
    b: number,
    x: number,
    y: number,
    nVal: number
  ): boolean => {
    if (!isLightNeutralBg) return false;
    if (x < w * 0.12 || x > w * 0.88 || y < h * 0.02 || y > h * 0.96) return false;
    if (nVal < 0.68) return false;
    const lum = pixelLum(r, g, b);
    const sat = pixelSat(r, g, b);
    // Warm skin or tattooed skin (where warm skin mixes with dark tattoo ink)
    return r > b + 8 && g >= b && r >= 85 && sat >= 12 && lum < meanBgLum - 12;
  };

  // Tolerance mapping (15..90, default 52)
  const clampedTol = Math.max(15, Math.min(90, tolerance));
  const tolNorm = (clampedTol - 15) / 75; // 0.0 to 1.0
  const maxBgDist = 28 + tolNorm * 32; // 28 to 60 (at default 52 -> 44)
  const maxStepDist = 16 + tolNorm * 18; // 16 to 34

  // Stage 2: Neural IS-Net Salient Segmentation
  const cacheKey = `${imageSrc.length}:${imageSrc.slice(0, 64)}:${imageSrc.slice(-64)}`;
  const neuralMask = await computeIsnetMask(img, w, h, cacheKey);

  const fgMask = new Uint8Array(w * h);
  fgMask.fill(1);
  const nxOff = [-1, 1, 0, 0, -1, 1, -1, 1];
  const nyOff = [0, 0, -1, 1, -1, -1, 1, 1];

  let usedNeural = false;
  const neuralCut = 0.46 + tolNorm * 0.10;
  if (neuralMask) {
    let fgPixels = 0;
    for (let i = 0; i < w * h; i++) {
      if (neuralMask[i] >= neuralCut) {
        fgPixels++;
      }
    }
    if (fgPixels >= w * h * 0.01) {
      usedNeural = true;
      for (let i = 0; i < w * h; i++) {
        fgMask[i] = neuralMask[i] >= neuralCut ? 1 : 0;
      }
    }
  }

  // Stage 3: Concave-Corner-Aware Directional Flood Fill
  {
    const queue = new Int32Array(w * h);
    const visitedBg = new Uint8Array(w * h);
    let qHead = 0;
    let qTail = 0;

    const trySeed = (x: number, y: number, force = false) => {
      const idx = y * w + x;
      if (visitedBg[idx]) return;
      if (!fgMask[idx]) {
        visitedBg[idx] = 1;
        queue[qTail++] = idx;
        return;
      }
      const p = idx * 4;
      const d = minBgDist(origRgb[p], origRgb[p + 1], origRgb[p + 2]);
      const onLeftOrRightBorder = x <= 2 || x >= w - 3;
      const nVal = usedNeural && neuralMask ? neuralMask[idx] : 0.0;
      if (force || d <= maxBgDist || (onLeftOrRightBorder && nVal < 0.78)) {
        fgMask[idx] = 0;
        visitedBg[idx] = 1;
        queue[qTail++] = idx;
      }
    };

    for (let x = 0; x < w; x++) {
      if (x < w * 0.25 || x > w * 0.75) {
        trySeed(x, 0);
        trySeed(x, h - 1);
      }
    }
    for (let y = 0; y < h; y++) {
      trySeed(0, y);
      trySeed(w - 1, y);
    }
    for (const pt of extraSamplePoints) {
      const sx = Math.max(0, Math.min(w - 1, Math.round(pt.xNorm * w)));
      const sy = Math.max(0, Math.min(h - 1, Math.round(pt.yNorm * h)));
      trySeed(sx, sy, true);
    }

    while (qHead < qTail) {
      const curr = queue[qHead++];
      const cy = Math.floor(curr / w);
      const cx = curr - cy * w;
      const cp = curr * 4;
      const cR = origRgb[cp];
      const cG = origRgb[cp + 1];
      const cB = origRgb[cp + 2];

      for (let k = 0; k < 8; k++) {
        const nx = cx + nxOff[k];
        const ny = cy + nyOff[k];
        if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
        const nIdx = ny * w + nx;
        if (visitedBg[nIdx]) continue;

        if (!fgMask[nIdx]) {
          visitedBg[nIdx] = 1;
          queue[qTail++] = nIdx;
          continue;
        }

        const np = nIdx * 4;
        const nR = origRgb[np];
        const nG = origRgb[np + 1];
        const nB = origRgb[np + 2];
        const nVal = usedNeural && neuralMask ? neuralMask[nIdx] : 0.8;

        if (isCentralHumanSkinOrTattoo(nR, nG, nB, nx, ny, nVal)) continue;

        const bgD = minBgDist(nR, nG, nB);
        const onOuterSideMargin = nx < w * 0.08 || nx > w * 0.92;

        if (usedNeural && neuralMask) {
          if (nVal >= 0.92 && !onOuterSideMargin) {
            continue;
          }
          if (nVal >= 0.72 && !onOuterSideMargin) {
            if (bgD > maxBgDist * 0.82 || pixelSat(nR, nG, nB) > 15) continue;
          } else {
            if (bgD > maxBgDist * (onOuterSideMargin ? 1.15 : 1.0)) continue;
          }
        } else {
          if (bgD > maxBgDist) continue;
        }

        const stepD = perceptualColorDist(nR, nG, nB, cR, cG, cB);
        if (stepD > maxStepDist) continue;

        fgMask[nIdx] = 0;
        visitedBg[nIdx] = 1;
        queue[qTail++] = nIdx;
      }
    }

    // Stage 3B: Enclosed Background Pockets near the Silhouette Waist/Arm Gaps
    const pocketVisited = new Uint8Array(w * h);
    const pocketQueue = new Int32Array(w * h);
    const tightPocketDist = maxBgDist * 0.72;

    for (let y = Math.floor(h * 0.08); y < Math.floor(h * 0.94); y++) {
      for (let x = Math.floor(w * 0.08); x < Math.floor(w * 0.92); x++) {
        const startIdx = y * w + x;
        if (!fgMask[startIdx] || pocketVisited[startIdx]) continue;
        if (usedNeural && neuralMask && neuralMask[startIdx] >= 0.90) {
          pocketVisited[startIdx] = 1;
          continue;
        }
        const sp = startIdx * 4;
        const sR = origRgb[sp];
        const sG = origRgb[sp + 1];
        const sB = origRgb[sp + 2];
        if (
          isCentralHumanSkinOrTattoo(sR, sG, sB, x, y, 0.8) ||
          minBgDist(sR, sG, sB) > tightPocketDist
        ) {
          pocketVisited[startIdx] = 1;
          continue;
        }

        let pHead = 0;
        let pTail = 0;
        pocketVisited[startIdx] = 1;
        pocketQueue[pTail++] = startIdx;
        let contrastBorder = 0;
        let totalBorder = 0;
        let nearOuterBg = false;

        while (pHead < pTail) {
          const curr = pocketQueue[pHead++];
          const cy = Math.floor(curr / w);
          const cx = curr - cy * w;

          if (!nearOuterBg) {
            const checkDist = 14;
            if (
              (cx >= checkDist && !fgMask[cy * w + (cx - checkDist)]) ||
              (cx < w - checkDist && !fgMask[cy * w + (cx + checkDist)]) ||
              (cy >= checkDist && !fgMask[(cy - checkDist) * w + cx]) ||
              (cy < h - checkDist && !fgMask[(cy + checkDist) * w + cx])
            ) {
              nearOuterBg = true;
            }
          }

          for (let k = 0; k < 4; k++) {
            const nx = cx + nxOff[k];
            const ny = cy + nyOff[k];
            if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
            const nIdx = ny * w + nx;
            if (pocketVisited[nIdx]) continue;
            const np = nIdx * 4;
            const nR = origRgb[np];
            const nG = origRgb[np + 1];
            const nB = origRgb[np + 2];
            const d = minBgDist(nR, nG, nB);
            if (
              fgMask[nIdx] &&
              !(usedNeural && neuralMask && neuralMask[nIdx] >= 0.90) &&
              !isCentralHumanSkinOrTattoo(nR, nG, nB, nx, ny, 0.8) &&
              d <= tightPocketDist
            ) {
              pocketVisited[nIdx] = 1;
              pocketQueue[pTail++] = nIdx;
            } else if (fgMask[nIdx]) {
              totalBorder++;
              if (d > maxBgDist * 0.95) contrastBorder++;
            }
          }
        }

        if (
          nearOuterBg &&
          pTail >= 6 &&
          pTail <= w * h * 0.045 &&
          totalBorder > 0 &&
          contrastBorder / totalBorder >= 0.65
        ) {
          for (let i = 0; i < pTail; i++) {
            fgMask[pocketQueue[i]] = 0;
          }
        }
      }
    }
  }

  // Stage 4: Peripheral Border Strip Pruning + Initial LCC Cleanup + Internal Pinhole Fill
  prunePeripheralBorderStrips(fgMask, w, h);
  filterLargestConnectedComponents(fgMask, w, h);

  // Fill internal pinholes (< 280px) inside the cloth/garment that do not match the studio background
  {
    const visited = new Uint8Array(w * h);
    const compQueue = new Int32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      if (fgMask[i] || visited[i]) continue;
      let head = 0;
      let tail = 0;
      visited[i] = 1;
      compQueue[tail++] = i;
      let touchesBorder = false;

      while (head < tail) {
        const curr = compQueue[head++];
        const cy = Math.floor(curr / w);
        const cx = curr - cy * w;
        if (cx === 0 || cx === w - 1 || cy === 0 || cy === h - 1) {
          touchesBorder = true;
        }
        for (let k = 0; k < 4; k++) {
          const nx = cx + nxOff[k];
          const ny = cy + nyOff[k];
          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const nIdx = ny * w + nx;
          if (!fgMask[nIdx] && !visited[nIdx]) {
            visited[nIdx] = 1;
            compQueue[tail++] = nIdx;
          }
        }
      }

      if (!touchesBorder && tail < 280) {
        const firstP = compQueue[0] * 4;
        const dFirst = minBgDist(origRgb[firstP], origRgb[firstP + 1], origRgb[firstP + 2]);
        if (dFirst > maxBgDist * 0.65) {
          for (let j = 0; j < tail; j++) {
            fgMask[compQueue[j]] = 1;
          }
        }
      }
    }
  }

  // Stage 5: SKIN & TATTOO-SAFE CONCAVE WEBBING & ACHROMATIC HALO STRIPPER (5 Passes)
  // Cleans out achromatic studio grey webbing in concave corners (under sleeve cuffs, neck/collar)
  // while strictly protecting facial profiles (nose/lips/chin), hair curls, and tattooed forearms so they never get faceted!
  const stripPasses = Math.round(4 + tolNorm * 3); // 4 to 7 passes
  for (let pass = 0; pass < stripPasses; pass++) {
    const toPeel: number[] = [];

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = y * w + x;
        if (!fgMask[idx]) continue;

        let bgNeighbors = 0;
        for (let k = 0; k < 8; k++) {
          if (!fgMask[(y + nyOff[k]) * w + (x + nxOff[k])]) {
            bgNeighbors++;
          }
        }
        if (bgNeighbors === 0) continue;

        if (bgNeighbors >= 6) {
          toPeel.push(idx);
          continue;
        }

        const p = idx * 4;
        const r = origRgb[p];
        const g = origRgb[p + 1];
        const b = origRgb[p + 2];
        const nVal = usedNeural && neuralMask ? neuralMask[idx] : 0.7;

        // Protect skin, nose, lips, chin, hair curls, and tattooed forearms
        if (isCentralHumanSkinOrTattoo(r, g, b, x, y, nVal)) continue;

        const onOuterSideMargin = x < w * 0.09 || x > w * 0.91;
        const lum = pixelLum(r, g, b);
        const sat = pixelSat(r, g, b);
        const dBg = minBgDist(r, g, b);

        // Peel outer side margin clutter (e.g. salmon/tan/brown border fragments on x < 9% or x > 91%)
        if (onOuterSideMargin && (dBg <= maxBgDist * 1.25 || nVal < 0.75)) {
          toPeel.push(idx);
          continue;
        }

        // Compare boundary pixel against deep interior color (8-14px inside)
        let fgSumR = 0,
          fgSumG = 0,
          fgSumB = 0,
          fgCnt = 0;
        for (let dy = -12; dy <= 12; dy += 4) {
          const ny = y + dy;
          if (ny < 2 || ny >= h - 2) continue;
          for (let dx = -12; dx <= 12; dx += 4) {
            const nx = x + dx;
            if (nx < 2 || nx >= w - 2) continue;
            if (dx * dx + dy * dy < 48) continue;
            const nIdx = ny * w + nx;
            if (
              fgMask[nIdx] &&
              fgMask[nIdx - 1] &&
              fgMask[nIdx + 1] &&
              fgMask[nIdx - w] &&
              fgMask[nIdx + w]
            ) {
              const np = nIdx * 4;
              fgSumR += origRgb[np];
              fgSumG += origRgb[np + 1];
              fgSumB += origRgb[np + 2];
              fgCnt++;
            }
          }
        }

        if (fgCnt > 0) {
          const fgR = fgSumR / fgCnt;
          const fgG = fgSumG / fgCnt;
          const fgB = fgSumB / fgCnt;
          const fgLum = pixelLum(fgR, fgG, fgB);
          const fgSat = pixelSat(fgR, fgG, fgB);
          const dFg = perceptualColorDist(r, g, b, fgR, fgG, fgB);

          // Protect any boundary where the interior is warm skin or tattooed forearm (`fgR > fgB + 7`)
          // UNLESS the boundary pixel itself is a pure achromatic studio grey web (`sat <= 12, lum > 140`)
          const interiorIsWarmOrTattoo =
            x >= w * 0.12 && x <= w * 0.88 && fgR > fgB + 7 && fgLum > 70;
          if (interiorIsWarmOrTattoo) {
            if (
              isLightNeutralBg &&
              sat <= 12 &&
              lum > 140 &&
              dBg <= maxBgDist * 0.95 &&
              dBg < dFg * 0.75
            ) {
              toPeel.push(idx);
            }
            continue;
          }

          // Peel achromatic studio grey webbing/halo on dark garments (e.g. under black sleeves)
          if (
            isLightNeutralBg &&
            sat <= 16 &&
            lum > 120 &&
            dFg > 26 &&
            dBg < dFg * 0.85 &&
            dBg <= maxBgDist * 1.2
          ) {
            toPeel.push(idx);
            continue;
          }

          if (
            isLightNeutralBg &&
            lum > fgLum + 28 &&
            lum > 120 &&
            sat < Math.max(18, fgSat * 0.68) &&
            dFg > 26 &&
            dBg < dFg * 0.95
          ) {
            toPeel.push(idx);
          }
        }
      }
    }

    if (toPeel.length === 0) break;
    for (let i = 0; i < toPeel.length; i++) {
      fgMask[toPeel[i]] = 0;
    }
  }

  prunePeripheralBorderStrips(fgMask, w, h);
  filterLargestConnectedComponents(fgMask, w, h);

  // Stage 6: CONTINUOUS SUB-PIXEL NEURAL FIELD + NATURAL OPTICAL EDGE MATTING
  // Instead of feeding a harsh 0/1 binary step into the contour filter (which causes "scissor-cut" polygonal facets),
  // we preserve IS-Net's continuous sub-pixel confidence ramp inside the cleaned `fgMask` support!
  const rawField = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    if (!fgMask[i]) {
      rawField[i] = 0.0;
    } else if (usedNeural && neuralMask) {
      // Smooth sub-pixel ramp from neuralCut..0.82 -> 0.52..1.0
      const nv = neuralMask[i];
      const ramp = (nv - neuralCut) / Math.max(0.15, 0.82 - neuralCut);
      rawField[i] = Math.max(0.52, Math.min(1.0, 0.52 + ramp * 0.48));
    } else {
      rawField[i] = 1.0;
    }
  }

  const sdfFine = multiPassGaussianFilter(rawField, w, h, 2, 2);
  const sdfSmooth = multiPassGaussianFilter(rawField, w, h, 5, 3);

  const sdf = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const fine = sdfFine[i];
    const smooth = sdfSmooth[i];
    const diff = Math.abs(smooth - fine);

    // Only lock to `sdfFine` at strong 90-degree concave/convex garment junctions (`diff > 0.13`, e.g. under sleeve cuff or sleeve tip).
    // All gentle curves (nose, lips, chin, neck, elbows, tattooed forearms where `diff <= 0.12`) use 100% `sdfSmooth`
    // so they are completely free of polygonal "scissor-cut" facets!
    const cornerWeight = Math.max(0, Math.min(1, (diff - 0.12) / 0.12));
    sdf[i] = smooth * (1 - cornerWeight) + fine * cornerWeight;
  }

  // Natural optical camera lens transition band (`halfBand = 0.11` instead of razor-hard `0.045`)
  // Creates a smooth ~2px sub-pixel anti-aliased alpha roll-off so edges look naturally photographed, never cut with scissors.
  const centerCut = 0.50 + tolNorm * 0.04; // 0.50 to 0.54
  const halfBand = 0.11;
  const lowCut = centerCut - halfBand;
  const highCut = centerCut + halfBand;
  const finalAlpha = new Float32Array(w * h);

  for (let i = 0; i < w * h; i++) {
    const v = sdf[i];
    if (v <= lowCut) {
      finalAlpha[i] = 0.0;
    } else if (v >= highCut) {
      finalAlpha[i] = 1.0;
    } else {
      const t = (v - lowCut) / (highCut - lowCut);
      finalAlpha[i] = t * t * (3 - 2 * t);
    }
  }

  // Post-SDF Connected-Component Cleanup (zero floating islands outside the main item)
  filterAlphaConnectedComponents(finalAlpha, w, h);

  // Stage 7: NATURAL OPTICAL EDGE UNMIXING + 100% UNTOUCHED INTERIOR COLORS
  // - Every opaque interior pixel (`isInsideShape === 1` or `a >= 0.96`) keeps 100% of its natural texture and shading
  //   (preserving tattooed forearm shading, skin highlights, hair strands, and white garment logos).
  // - Only semi-transparent feathered edge pixels (`a < 0.96`) or strong grey backdrop bleed are proportionally unmixed
  //   toward bilateral color-matched interior core pixels (`decontamMix`), avoiding any flat "painted / scissor-cut" rim!
  const isInsideShape = new Uint8Array(w * h);
  const isCleanDonorCore = new Uint8Array(w * h);
  for (let y = 3; y < h - 3; y++) {
    for (let x = 3; x < w - 3; x++) {
      const idx = y * w + x;
      if (
        sdfFine[idx] >= 0.92 &&
        finalAlpha[idx] >= 0.98 &&
        finalAlpha[idx - 3] >= 0.95 &&
        finalAlpha[idx + 3] >= 0.95 &&
        finalAlpha[idx - w * 3] >= 0.95 &&
        finalAlpha[idx + w * 3] >= 0.95
      ) {
        isInsideShape[idx] = 1;
        const p = idx * 4;
        if (!isLightNeutralBg || minBgDist(origRgb[p], origRgb[p + 1], origRgb[p + 2]) > maxBgDist * 0.65) {
          isCleanDonorCore[idx] = 1;
        }
      }
    }
  }

  const fgCanvas = document.createElement('canvas');
  fgCanvas.width = w;
  fgCanvas.height = h;
  const fgCtx = fgCanvas.getContext('2d');
  if (!fgCtx) throw new Error('Foreground canvas context unavailable');

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = y * w + x;
      const p = idx * 4;
      const a = finalAlpha[idx];

      if (a <= 0.005) {
        data[p] = 255;
        data[p + 1] = 255;
        data[p + 2] = 255;
        data[p + 3] = 0;
        continue;
      }

      let r = origRgb[p];
      let g = origRgb[p + 1];
      let b = origRgb[p + 2];

      if (!isInsideShape[idx]) {
        let sumR = 0,
          sumG = 0,
          sumB = 0,
          wSum = 0;
        for (let dy = -8; dy <= 8; dy += 2) {
          const ny = y + dy;
          if (ny < 3 || ny >= h - 3) continue;
          for (let dx = -8; dx <= 8; dx += 2) {
            const nx = x + dx;
            if (nx < 3 || nx >= w - 3) continue;
            const nIdx = ny * w + nx;
            if (isCleanDonorCore[nIdx]) {
              const np = nIdx * 4;
              const nr = origRgb[np];
              const ng = origRgb[np + 1];
              const nb = origRgb[np + 2];
              const distSq = dx * dx + dy * dy;
              const colorD = perceptualColorDist(r, g, b, nr, ng, nb);
              const colorWeight = 1 / (1 + (colorD / 32) * (colorD / 32));
              const wgt = (1 / (1 + distSq * 0.35)) * colorWeight;
              sumR += nr * wgt;
              sumG += ng * wgt;
              sumB += nb * wgt;
              wSum += wgt;
            }
          }
        }

        if (wSum > 0) {
          const coreR = sumR / wSum;
          const coreG = sumG / wSum;
          const coreB = sumB / wSum;
          const coreLum = pixelLum(coreR, coreG, coreB);
          const pixLum = pixelLum(r, g, b);
          const pixSat = pixelSat(r, g, b);

          // Proportional optical unmixing:
          // - On semi-transparent feathered pixels (`a < 0.96`), gently unmix background brightness proportional to `(1 - a)`
          // - On opaque rim pixels (`a >= 0.96`), only unmix if the pixel is an achromatic grey background halo (`pixSat <= 14 && pixLum > coreLum + 24`)
          let mix = 0.0;
          if (a < 0.96 && pixLum > coreLum + 6) {
            mix = Math.min(0.9, (1 - a) * 1.15 + Math.max(0, (pixLum - coreLum - 6) / 90) * 0.35);
          } else if (
            isLightNeutralBg &&
            pixSat <= 14 &&
            pixLum > coreLum + 24 &&
            minBgDist(r, g, b) <= maxBgDist * 0.9
          ) {
            mix = 0.7;
          }

          if (mix > 0) {
            r = Math.round(r * (1 - mix) + coreR * mix);
            g = Math.round(g * (1 - mix) + coreG * mix);
            b = Math.round(b * (1 - mix) + coreB * mix);
          }
        }
      }

      data[p] = r;
      data[p + 1] = g;
      data[p + 2] = b;
      data[p + 3] = Math.round(a * 255);
    }
  }

  fgCtx.putImageData(imgData, 0, 0);

  // Composite onto the clean studio background (100% Pure #FFFFFF outside the edge by default)
  const outCanvas = document.createElement('canvas');
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) throw new Error('Output canvas context unavailable');

  if (customHex) {
    outCtx.fillStyle = customHex;
    outCtx.fillRect(0, 0, w, h);
  } else if (preset === 'pure-white') {
    outCtx.fillStyle = '#FFFFFF';
    outCtx.fillRect(0, 0, w, h);
  } else if (preset === 'studio-daylight') {
    const grad = outCtx.createRadialGradient(
      w * 0.5,
      h * 0.45,
      w * 0.1,
      w * 0.5,
      h * 0.5,
      Math.max(w, h) * 0.75
    );
    grad.addColorStop(0, '#FFFFFF');
    grad.addColorStop(0.65, '#FAFAFA');
    grad.addColorStop(1, '#EFECE6');
    outCtx.fillStyle = grad;
    outCtx.fillRect(0, 0, w, h);
  } else if (preset === 'studio-floor') {
    const wallGrad = outCtx.createLinearGradient(0, 0, 0, h * 0.82);
    wallGrad.addColorStop(0, '#FFFFFF');
    wallGrad.addColorStop(1, '#F8F8F8');
    outCtx.fillStyle = wallGrad;
    outCtx.fillRect(0, 0, w, h * 0.82);

    const floorGrad = outCtx.createLinearGradient(0, h * 0.82, 0, h);
    floorGrad.addColorStop(0, '#ECECEC');
    floorGrad.addColorStop(0.3, '#F6F6F6');
    floorGrad.addColorStop(1, '#FFFFFF');
    outCtx.fillStyle = floorGrad;
    outCtx.fillRect(0, h * 0.82, w, h * 0.18);
  } else if (preset === 'warm-alabaster') {
    outCtx.fillStyle = '#FAF8F5';
    outCtx.fillRect(0, 0, w, h);
  } else if (preset === 'atelier-cream') {
    outCtx.fillStyle = '#F4F0EA';
    outCtx.fillRect(0, 0, w, h);
  } else if (preset === 'pearl-grey') {
    outCtx.fillStyle = '#EFEFF1';
    outCtx.fillRect(0, 0, w, h);
  }

  outCtx.drawImage(fgCanvas, 0, 0);

  return outCanvas.toDataURL('image/png');
}
