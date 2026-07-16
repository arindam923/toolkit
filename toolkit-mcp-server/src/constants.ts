import { z } from "zod";

export const SUPPORTED_INPUT_FORMATS = ["jpg", "jpeg", "png", "webp", "avif", "tiff", "gif"] as const;
export const SUPPORTED_OUTPUT_FORMATS = ["jpg", "jpeg", "png", "webp", "avif", "tiff"] as const;

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_DIMENSION = 16384;
export const DEFAULT_QUALITY = 90;

export const RESIZE_PRESETS = {
  social: { width: 1080, height: 1080 },
  web: { width: 1200, height: 800 },
  print: { width: 2400, height: 1800 },
  thumbnail: { width: 300, height: 200 },
} as const;

export const COMPRESS_PRESETS = {
  web_optimized: { quality: 80, output_format: "webp" as const, max_width: 1920 },
  email: { quality: 60, output_format: "jpeg" as const, max_width: 800 },
  social_media: { quality: 85, output_format: "jpeg" as const, max_width: 1080 },
  thumbnail: { quality: 70, output_format: "jpeg" as const, max_width: 300 },
} as const;

export const CROP_ASPECT_PRESETS = ["free", "1:1", "4:3", "16:9", "9:16"] as const;

export const FILTER_PRESETS = {
  vintage: { brightness: 110, saturation: 80, contrast: 120, grayscale: 0 },
  vivid: { brightness: 105, saturation: 130, contrast: 115, grayscale: 0 },
  black_and_white: { brightness: 100, saturation: 0, contrast: 100, grayscale: 100 },
  cinematic: { brightness: 95, saturation: 90, contrast: 130, grayscale: 0 },
  soft_focus: { brightness: 105, saturation: 95, contrast: 90, grayscale: 0 },
} as const;

export const EFFECTS_PRESETS = {
  sepia: { grayscale: 100, sepia: 100, brightness: 100, saturation: 100 },
  vintage: { sepia: 40, brightness: 110, saturation: 80, contrast: 120 },
  hdr: { brightness: 115, saturation: 140, contrast: 130 },
  warm: { sepia: 20, brightness: 105, saturation: 110 },
  cool: { brightness: 100, saturation: 90, blue_shift: 30 },
  sketch: { grayscale: 100, contrast: 150, brightness: 120 },
  emboss: { grayscale: 100, contrast: 140, brightness: 110, edge: true },
} as const;

export const ResizePresetSchema = z.enum(["social", "web", "print", "thumbnail"]);
export const CompressPresetSchema = z.enum(["web_optimized", "email", "social_media", "thumbnail"]);
export const CropAspectPresetSchema = z.enum(CROP_ASPECT_PRESETS);
export const FilterPresetSchema = z.enum(Object.keys(FILTER_PRESETS) as [string, ...string[]]);
export const EffectsPresetSchema = z.enum(Object.keys(EFFECTS_PRESETS) as [string, ...string[]]);
export const OutputFormatSchema = z.enum(["jpeg", "jpg", "png", "webp", "avif", "tiff"]);