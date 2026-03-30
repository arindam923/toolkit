/**
 * Image Restoration Service
 *
 * Old photo fix pipeline using TensorFlow.js + OpenCV.js
 * Extracted from the standalone AI Image Restorer.
 *
 * Pipeline:
 * 1. Noise Reduction (OpenCV fastNlMeansDenoisingColored / fallback box blur)
 * 2. Smart Sharpening (TF.js convolution kernel)
 * 3. Contrast & Clarity (OpenCV CLAHE / fallback contrast stretch)
 * 4. Vibrance Boost (TF.js saturation enhancement)
 * 5. Face Enhancement (TF.js skin-masked sharpening)
 */

/* eslint-disable @typescript-eslint/no-explicit-any -- OpenCV.js and TF.js are dynamically loaded with no types */

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface RestorationSettings {
  denoise: boolean;
  denoiseStrength: number; // 1–20
  sharpen: boolean;
  sharpenStrength: number; // 0–3 step 0.1
  contrast: boolean;
  clarity: number; // 1–100
  vibrance: boolean;
  faceEnhance: boolean;
}

export const OLD_PHOTO_PRESET: RestorationSettings = {
  denoise: true,
  denoiseStrength: 7,
  sharpen: true,
  sharpenStrength: 1.2,
  contrast: true,
  clarity: 40,
  vibrance: true,
  faceEnhance: false,
};

export type ProgressCallback = (pct: number, msg: string) => void;

// ─────────────────────────────────────────────
// Dynamic library loaders
// ─────────────────────────────────────────────

let tfReady: Promise<typeof import("@tensorflow/tfjs")> | null = null;
let cvReady: Promise<any> | null = null;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
}

async function getTF() {
  if (!tfReady) {
    tfReady = import("@tensorflow/tfjs");
  }
  return tfReady;
}

async function getCV(): Promise<any> {
  if (!cvReady) {
    cvReady = (async () => {
      if (typeof (window as any).cv !== "undefined" && (window as any).cv.Mat) {
        return (window as any).cv;
      }
      await loadScript(
        "https://cdn.jsdelivr.net/npm/opencv.js@1.2.1/opencv.js",
      );
      if (
        typeof (window as any).cv !== "undefined" &&
        (window as any).cv.Mat
      ) {
        return (window as any).cv;
      }
      // Wait for async initialization
      await new Promise<void>((resolve) => {
        (window as any).onOpenCvReady = () => resolve();
        setTimeout(() => resolve(), 2000);
      });
      return (window as any).cv;
    })();
  }
  return cvReady;
}

// ─────────────────────────────────────────────
// Main restore function
// ─────────────────────────────────────────────

export async function restoreImage(
  dataUrl: string,
  settings: RestorationSettings,
  onProgress?: ProgressCallback,
): Promise<string> {
  const p = (pct: number, msg: string) => onProgress?.(pct, msg);

  p(5, "Loading image…");

  const img = await loadImage(dataUrl);
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // Draw source onto canvas
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext("2d")!;
  srcCtx.drawImage(img, 0, 0);
  let imageData = srcCtx.getImageData(0, 0, w, h);

  // ── Step 1: Denoise (OpenCV or fallback) ──
  if (settings.denoise) {
    p(15, "Reducing noise…");
    try {
      const cv = await getCV();
      imageData = opencvDenoise(cv, imageData, w, h, settings.denoiseStrength);
    } catch {
      console.warn("OpenCV unavailable, using fallback denoise");
      imageData = fallbackDenoise(imageData, w, h, settings.denoiseStrength);
    }
  }

  // ── Step 2–5: TensorFlow pipeline (sharpen, vibrance, face) ──
  const needsTF =
    settings.sharpen || settings.vibrance || settings.faceEnhance;

  if (needsTF) {
    p(40, "Applying AI enhancement…");
    const tf = await getTF();
    imageData = await tfEnhance(tf, imageData, w, h, settings);
  }

  // ── Step 6: Contrast/CLAHE (OpenCV or fallback) ──
  if (settings.contrast) {
    p(80, "Enhancing contrast…");
    try {
      const cv = await getCV();
      imageData = opencvCLAHE(cv, imageData, w, h, settings.clarity);
    } catch {
      console.warn("OpenCV unavailable, using fallback contrast");
      imageData = fallbackContrast(imageData, settings.clarity / 100);
    }
  }

  p(95, "Finalizing…");

  // Write back to canvas
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  outCanvas.getContext("2d")!.putImageData(imageData, 0, 0);

  p(100, "Done");
  return outCanvas.toDataURL("image/png");
}

// ─────────────────────────────────────────────
// OpenCV denoise
// ─────────────────────────────────────────────

function opencvDenoise(
  cv: any,
  imageData: ImageData,
  w: number,
  h: number,
  strength: number,
): ImageData {
  const src = cv.matFromImageData(imageData);
  const dst = new cv.Mat();
  try {
    cv.fastNlMeansDenoisingColored(src, dst, strength, strength, 7, 21);
    return new ImageData(new Uint8ClampedArray(dst.data), w, h);
  } finally {
    src.delete();
    dst.delete();
  }
}

// ─────────────────────────────────────────────
// OpenCV CLAHE contrast
// ─────────────────────────────────────────────

function opencvCLAHE(
  cv: any,
  imageData: ImageData,
  w: number,
  h: number,
  clarity: number,
): ImageData {
  const src = cv.matFromImageData(imageData);
  const dst = new cv.Mat();
  const dst2 = new cv.Mat();
  try {
    const clipLimit = clarity / 10;
    cv.cvtColor(src, dst, cv.COLOR_RGBA2RGB);
    cv.cvtColor(dst, dst2, cv.COLOR_RGB2Lab);

    const planes = new cv.MatVector();
    cv.split(dst2, planes);
    const clahe = new cv.CLAHE(clipLimit, new cv.Size(8, 8));
    clahe.apply(planes.get(0), planes.get(0));
    cv.merge(planes, dst2);

    cv.cvtColor(dst2, dst, cv.COLOR_Lab2RGB);
    cv.cvtColor(dst, src, cv.COLOR_RGB2RGBA);

    planes.delete();
    clahe.delete();

    return new ImageData(new Uint8ClampedArray(src.data), w, h);
  } finally {
    src.delete();
    dst.delete();
    dst2.delete();
  }
}

// ─────────────────────────────────────────────
// TensorFlow enhancement (sharpen + vibrance + face)
// ─────────────────────────────────────────────

async function tfEnhance(
  tf: typeof import("@tensorflow/tfjs"),
  imageData: ImageData,
  w: number,
  h: number,
  settings: RestorationSettings,
): Promise<ImageData> {
  // Put imageData onto temp canvas for tf.browser.fromPixels
  const tmp = document.createElement("canvas");
  tmp.width = w;
  tmp.height = h;
  tmp.getContext("2d")!.putImageData(imageData, 0, 0);

  return (tf as any).tidy(() => {
    const tensor = (tf as any).browser.fromPixels(tmp, 3).toFloat().div(255);
    let enhanced = tensor;

    // Sharpen
    if (settings.sharpen) {
      const s = settings.sharpenStrength;
      const k = tf.tensor4d(
        [
          [0, -s * 0.3, 0],
          [-s * 0.3, 1 + s * 1.2, -s * 0.3],
          [0, -s * 0.3, 0],
        ].map((row) => row.map((v) => [[v]])),
        [3, 3, 1, 1],
      );

      const channels = tf.split(enhanced.expandDims(0), 3, 3);
      const sharpened = channels.map((ch) =>
        tf.conv2d(ch as any, k, 1, "same").clipByValue(0, 1),
      );
      enhanced = tf.concat(sharpened, 3).squeeze([0]);
    }

    // Vibrance boost
    if (settings.vibrance) {
      const gray = enhanced.mean(2, true);
      enhanced = enhanced.sub(gray).mul(1.3).add(gray).clipByValue(0, 1);
    }

    // Face enhancement
    if (settings.faceEnhance) {
      const skinMask = buildSkinMask(enhanced);
      const fk = tf.tensor4d(
        [
          [-0.1, -0.1, -0.1],
          [-0.1, 1.8, -0.1],
          [-0.1, -0.1, -0.1],
        ].map((row) => row.map((v) => [[v]])),
        [3, 3, 1, 1],
      );
      const ch2 = tf.split(enhanced.expandDims(0), 3, 3);
      const faceSharp = ch2.map((ch) =>
        tf.conv2d(ch as any, fk, 1, "same").clipByValue(0, 1),
      );
      const faceEnhanced = tf.concat(faceSharp, 3).squeeze([0]);
      enhanced = tf.where(skinMask, faceEnhanced, enhanced);
    }

    // Convert back to ImageData (RGBA)
    const uint8 = enhanced.mul(255).clipByValue(0, 255).cast("int32");
    const arr = uint8.dataSync();
    const result = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      result[i * 4] = arr[i * 3];
      result[i * 4 + 1] = arr[i * 3 + 1];
      result[i * 4 + 2] = arr[i * 3 + 2];
      result[i * 4 + 3] = imageData.data[i * 4 + 3];
    }
    return new ImageData(result, w, h);
  });
}

// ─────────────────────────────────────────────
// Skin mask for face detection
// ─────────────────────────────────────────────

function buildSkinMask(tensor: any) {
  const r = tensor.slice([0, 0, 0], [tensor.shape[0], tensor.shape[1], 1]);
  const g = tensor.slice([0, 0, 1], [tensor.shape[0], tensor.shape[1], 1]);
  const b = tensor.slice([0, 0, 2], [tensor.shape[0], tensor.shape[1], 1]);

  const skinR = r.greater(0.35).logicalAnd(r.less(0.95));
  const skinG = g.greater(0.2).logicalAnd(g.less(0.75));
  const skinB = b.greater(0.15).logicalAnd(b.less(0.7));
  const rGtG = r.greater(g);
  const rGtB = r.greater(b);

  return skinR.logicalAnd(skinG).logicalAnd(skinB).logicalAnd(rGtG).logicalAnd(rGtB);
}

// ─────────────────────────────────────────────
// Fallback denoise (box blur)
// ─────────────────────────────────────────────

function fallbackDenoise(
  imageData: ImageData,
  w: number,
  h: number,
  strength: number,
): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = Math.min(strength / 20, 1);
  const copy = new Uint8ClampedArray(data);

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const sum =
          copy[i + c] * 4 +
          copy[((y - 1) * w + x) * 4 + c] +
          copy[((y + 1) * w + x) * 4 + c] +
          copy[(y * w + x - 1) * 4 + c] +
          copy[(y * w + x + 1) * 4 + c];
        data[i + c] = Math.round(
          copy[i + c] * (1 - factor) + (sum / 8) * factor,
        );
      }
    }
  }
  return new ImageData(data, w, h);
}

// ─────────────────────────────────────────────
// Fallback contrast
// ─────────────────────────────────────────────

function fallbackContrast(imageData: ImageData, amount: number): ImageData {
  const data = new Uint8ClampedArray(imageData.data);
  const factor = 1 + amount;
  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      data[i + c] = Math.min(
        255,
        Math.max(0, (data[i + c] - 128) * factor + 128),
      );
    }
  }
  return new ImageData(data, imageData.width, imageData.height);
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
