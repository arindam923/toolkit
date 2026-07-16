export interface ImageMetadata {
  width: number;
  height: number;
  channels: number;
  format: string;
  size: number;
  density: number;
  hasAlpha: boolean;
  isProgressive: boolean;
}

export interface ToolResult {
  [x: string]: unknown;
  content: [{ type: "text"; text: string }];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

export type FitMode = "cover" | "contain" | "fill" | "inside" | "outside";

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit: FitMode;
  maintainAspect: boolean;
  withoutEnlargement: boolean;
}

export interface CompressOptions {
  quality: number;
  outputFormat: "jpeg" | "webp" | "png" | "avif";
  maxWidth?: number;
  progressive?: boolean;
}

export interface CropOptions {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RotateOptions {
  degrees: number;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface FilterOptions {
  brightness?: number;
  saturation?: number;
  contrast?: number;
  blur?: number;
  grayscale?: number;
}