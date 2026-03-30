/**
 * Gemini Image Service
 *
 * Purpose:
 * - Centralize image generation/edit requests to Gemini for:
 *   1) Upscaling
 *   2) Restoration (old photos, denoise, color recovery, etc.)
 *   3) Style edits (via custom prompt)
 *
 * Notes:
 * - This module is browser-safe (no Node Buffer usage).
 * - It assumes a Next.js API proxy route exists at:
 *   POST /api/images/gemini-edit
 * - The API route should return either:
 *   { imageBase64: string, mimeType?: string, model?: string, latencyMs?: number }
 *   or an error payload.
 */

export type GeminiEditMode =
  | "upscale"
  | "restoration"
  | "style";

export interface GeminiImageSettings {
  mode: GeminiEditMode;
  scale?: 2 | 4;
  quality?: number; // 1-100
  stylePrompt?: string;
  preserveComposition?: boolean;
  faceEnhance?: boolean;
  denoiseStrength?: number; // 0-100
  colorRecovery?: boolean;
  scratchRemoval?: boolean;
}

export interface GeminiImageEditRequest {
  file: File;
  settings: GeminiImageSettings;
}

export interface GeminiImageEditResult {
  dataUrl: string;
  mimeType: string;
  method: "gemini";
  model?: string;
  width: number;
  height: number;
  latencyMs?: number;
}

interface GeminiEditApiSuccess {
  imageBase64: string;
  mimeType?: string;
  mediaType?: string;
  model?: string;
  latencyMs?: number;
}

interface GeminiEditApiError {
  error: string;
  details?: string;
}

const DEFAULT_MIME = "image/png";

function clamp(
  value: number,
  min: number,
  max: number,
): number {
  return Math.min(max, Math.max(min, value));
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () =>
      reject(new Error("Failed to read file"));
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.includes(",")
        ? result.split(",")[1]
        : result;
      resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}

function base64ToDataUrl(
  base64: string,
  mimeType: string,
): string {
  return `data:${mimeType};base64,${base64}`;
}

function getImageDimensions(
  dataUrl: string,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () =>
      reject(new Error("Failed to load generated image"));
    img.onload = () =>
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    img.src = dataUrl;
  });
}

function upscalePrompt(
  settings: GeminiImageSettings,
): string {
  const scale = settings.scale ?? 2;
  const quality = clamp(settings.quality ?? 90, 1, 100);

  return [
    "You are a professional image enhancement model.",
    "Task: upscale this image while preserving content identity.",
    `Target scale: ${scale}x.`,
    `Target quality preference: ${quality}/100.`,
    "Hard requirements:",
    "- Preserve composition, framing, and object geometry.",
    "- Preserve text legibility if text exists.",
    "- Avoid hallucinating new objects, logos, or watermarks.",
    "- Keep skin tones natural and avoid over-sharpening artifacts.",
    "- Return only the edited image output.",
  ].join("\n");
}

function restorationPrompt(
  settings: GeminiImageSettings,
): string {
  const denoise = clamp(
    settings.denoiseStrength ?? 40,
    0,
    100,
  );
  const faceEnhance = settings.faceEnhance ?? false;
  const colorRecovery = settings.colorRecovery ?? true;
  const scratchRemoval = settings.scratchRemoval ?? true;
  const preserveComposition =
    settings.preserveComposition ?? true;

  return [
    "You are a professional photo restoration model.",
    "Task: restore and clean this image while preserving authenticity.",
    `Denoise strength: ${denoise}/100.`,
    `Face enhancement: ${faceEnhance ? "enabled" : "disabled"}.`,
    `Color recovery: ${colorRecovery ? "enabled" : "disabled"}.`,
    `Scratch/dust removal: ${scratchRemoval ? "enabled" : "disabled"}.`,
    `Preserve original composition: ${preserveComposition ? "yes" : "no"}.`,
    "Hard requirements:",
    "- Reduce noise, compression artifacts, scratches, and fading.",
    "- Preserve original identity and scene layout.",
    "- Avoid fake details that materially change the subject.",
    "- Avoid plastic skin look and halo artifacts.",
    "- Return only the edited image output.",
  ].join("\n");
}

function stylePrompt(
  settings: GeminiImageSettings,
): string {
  const custom = (settings.stylePrompt || "").trim();
  if (!custom) {
    throw new Error(
      "Style mode requires a non-empty stylePrompt",
    );
  }

  const preserveComposition =
    settings.preserveComposition ?? true;
  return [
    "You are a creative image editing model.",
    "Apply the requested style edit to the input image.",
    `Preserve composition: ${preserveComposition ? "yes" : "no"}.`,
    "User style instruction:",
    custom,
    "Hard requirements:",
    "- Keep output clean and high quality.",
    "- Avoid adding signatures/watermarks/text unless explicitly requested.",
    "- Return only the edited image output.",
  ].join("\n");
}

function buildPrompt(
  settings: GeminiImageSettings,
): string {
  switch (settings.mode) {
    case "upscale":
      return upscalePrompt(settings);
    case "restoration":
      return restorationPrompt(settings);
    case "style":
      return stylePrompt(settings);
    default:
      return "Enhance this image while preserving subject and composition.";
  }
}

/**
 * Main Gemini edit function used by upscaler/restoration pages.
 */
export async function editImageWithGemini(
  request: GeminiImageEditRequest,
): Promise<GeminiImageEditResult> {
  const { file, settings } = request;

  const base64Image = await fileToBase64(file);
  const mediaType = file.type || DEFAULT_MIME;
  const prompt = buildPrompt(settings);

  const response = await fetch("/api/images/gemini-edit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      base64Image,
      mediaType,
      prompt,
      mode: settings.mode,
      options: {
        scale: settings.scale ?? 2,
        quality: clamp(settings.quality ?? 90, 1, 100),
        preserveComposition:
          settings.preserveComposition ?? true,
        faceEnhance: settings.faceEnhance ?? false,
        denoiseStrength: clamp(
          settings.denoiseStrength ?? 40,
          0,
          100,
        ),
        colorRecovery: settings.colorRecovery ?? true,
        scratchRemoval: settings.scratchRemoval ?? true,
      },
    }),
  });

  const body = (await response.json()) as
    | GeminiEditApiSuccess
    | GeminiEditApiError;

  if (!response.ok) {
    const err = body as GeminiEditApiError;
    throw new Error(
      err.details
        ? `${err.error}: ${err.details}`
        : err.error || "Gemini edit failed",
    );
  }

  const ok = body as GeminiEditApiSuccess;
  if (
    !ok.imageBase64 ||
    typeof ok.imageBase64 !== "string"
  ) {
    throw new Error(
      "Gemini edit API returned no imageBase64",
    );
  }

  const outputMime =
    ok.mediaType || ok.mimeType || DEFAULT_MIME;
  const dataUrl = base64ToDataUrl(
    ok.imageBase64,
    outputMime,
  );
  const dimensions = await getImageDimensions(dataUrl);

  return {
    dataUrl,
    mimeType: outputMime,
    method: "gemini",
    model: ok.model,
    latencyMs: ok.latencyMs,
    width: dimensions.width,
    height: dimensions.height,
  };
}

/**
 * Convenience wrapper for upscaling.
 */
export async function upscaleWithGemini(
  file: File,
  options: { scale?: 2 | 4; quality?: number } = {},
): Promise<GeminiImageEditResult> {
  return editImageWithGemini({
    file,
    settings: {
      mode: "upscale",
      scale: options.scale ?? 2,
      quality: options.quality ?? 90,
      preserveComposition: true,
    },
  });
}

/**
 * Convenience wrapper for restoration.
 */
export async function restoreWithGemini(
  file: File,
  options: {
    denoiseStrength?: number;
    faceEnhance?: boolean;
    colorRecovery?: boolean;
    scratchRemoval?: boolean;
    preserveComposition?: boolean;
  } = {},
): Promise<GeminiImageEditResult> {
  return editImageWithGemini({
    file,
    settings: {
      mode: "restoration",
      denoiseStrength: options.denoiseStrength ?? 40,
      faceEnhance: options.faceEnhance ?? false,
      colorRecovery: options.colorRecovery ?? true,
      scratchRemoval: options.scratchRemoval ?? true,
      preserveComposition:
        options.preserveComposition ?? true,
    },
  });
}

/**
 * Convenience wrapper for style editing.
 */
export async function styleEditWithGemini(
  file: File,
  stylePromptText: string,
  options: {
    preserveComposition?: boolean;
    quality?: number;
  } = {},
): Promise<GeminiImageEditResult> {
  return editImageWithGemini({
    file,
    settings: {
      mode: "style",
      stylePrompt: stylePromptText,
      preserveComposition:
        options.preserveComposition ?? true,
      quality: options.quality ?? 90,
    },
  });
}
