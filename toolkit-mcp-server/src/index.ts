#!/usr/bin/env node
/**
 * Toolkit MCP Server
 *
 * Exposes the Toolkit image utilities to AI agents via the Model Context
 * Protocol (stdio transport). All processing happens locally with sharp —
 * no network, no uploads.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { ResizeSchema, imageResize } from "./tools/image-resize.js";
import {
  CompressSchema, imageCompress,
  ConvertSchema, imageConvert,
  CropSchema, imageCrop,
  RotateSchema, imageRotate,
  FilterSchema, imageFilter,
} from "./tools/image-tools.js";
import { EffectsSchema, imageEffects } from "./tools/image-effects.js";
import { WatermarkSchema, imageWatermark } from "./tools/image-watermark.js";
import { ExtractColorsSchema, imageExtractColors } from "./tools/image-extract-colors.js";
import { UpscaleSchema, imageUpscale } from "./tools/image-upscale.js";
import { BgRemoveSchema, imageBgRemove } from "./tools/image-bg-remove.js";
import { PdfMergeSchema, pdfMerge } from "./tools/pdf-merge.js";
import { PdfSplitSchema, pdfSplit } from "./tools/pdf-split.js";
import { PdfCompressSchema, pdfCompress } from "./tools/pdf-compress.js";
import { PdfOcrSchema, pdfOcr } from "./tools/pdf-ocr.js";
import { PdfToImageSchema, pdfToImage } from "./tools/pdf-to-image.js";
import { ImageToPdfSchema, imageToPdf } from "./tools/image-to-pdf.js";
import { PdfRedactSchema, pdfRedact } from "./tools/pdf-redact.js";
import { FileConvertSchema, fileConvert } from "./tools/file-convert.js";

const server = new McpServer({
  name: "toolkit-mcp-server",
  version: "1.0.0",
});

// Trivial health-check tool (kept after build for smoke testing)
server.registerTool(
  "toolkit_ping",
  {
    title: "Toolkit Ping",
    description: "Health check. Returns 'pong' and the server version. Use to verify the Toolkit MCP server is reachable.",
    inputSchema: {},
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async () => ({
    content: [{ type: "text", text: "pong" }],
  }),
);

server.registerTool(
  "toolkit_image_resize",
  {
    title: "Image Resize",
    description: `Resize an image by pixels, percentage, or a named preset.

Args:
  - input_path (string): Path to input image (JPG, PNG, WebP, AVIF, TIFF, GIF)
  - output_path (string, optional): Path for output. Default: input_path + '_resized'
  - width (int): Target width in pixels (1..16384)
  - height (int): Target height in pixels (1..16384)
  - scale_percent (number): Scale by percentage (e.g. 50 = half, 200 = double)
  - preset: 'social' (1080x1080) | 'web' (1200x800) | 'print' (2400x1800) | 'thumbnail' (300x200)
  - fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' (default 'cover')
  - maintain_aspect (bool, default true)
  - quality (1-100, default 90)

Returns:
  Text summary + structured: { output_path, original_dimensions, new_dimensions, original_size_bytes, new_size_bytes }

Examples:
  - Resize to 800px wide keeping aspect: { input_path: "in.jpg", width: 800 }
  - Half-size thumbnail: { input_path: "in.jpg", scale_percent: 50 }
  - Instagram post: { input_path: "in.jpg", preset: "social" }

Errors:
  - 'Input file not found' — path does not exist
  - 'Unsupported input format' — file is not a supported image
  - 'Provide at least one of: width, height, scale_percent, or preset'`,
    inputSchema: ResizeSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageResize,
);

server.registerTool(
  "toolkit_image_compress",
  {
    title: "Image Compress",
    description: `Compress an image with quality control. Defaults to WebP for best compression.

Args:
  - input_path (string): Path to input image
  - output_path (string, optional): output path (default: input_path + '_compressed.<ext>')
  - quality (1-100, optional): output quality. Defaults follow preset (80 web_optimized)
  - output_format: 'jpeg' | 'webp' | 'png' | 'avif' (default 'webp')
  - max_width (int, optional): resize down if wider than this
  - progressive (bool, default true): progressive JPEG encoding
  - preset: 'web_optimized' | 'email' | 'social_media' | 'thumbnail'

Returns:
  Text summary + structured: { output_path, original_size_bytes, new_size_bytes, reduction_percent, output_format, quality }

Examples:
  - WebP at quality 80: { input_path: "in.png", quality: 80 }
  - Email preset: { input_path: "in.jpg", preset: "email" }
  - 1080p social: { input_path: "in.jpg", preset: "social_media" }`,
    inputSchema: CompressSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageCompress,
);

server.registerTool(
  "toolkit_image_convert",
  {
    title: "Image Convert",
    description: `Convert an image between formats (JPEG, PNG, WebP, AVIF, TIFF).

Args:
  - input_path (string): Path to input image
  - output_path (string, optional): output path (default: input_path + '_converted.<ext>')
  - format: 'jpeg' | 'jpg' | 'png' | 'webp' | 'avif' | 'tiff' (required)
  - quality (1-100, default 90)

Returns:
  Text summary + structured: { output_path, original_format, new_format, original_size_bytes, new_size_bytes }

Examples:
  - PNG to JPG: { input_path: "logo.png", format: "jpg", quality: 90 }
  - JPEG to WebP: { input_path: "photo.jpg", format: "webp", quality: 85 }`,
    inputSchema: ConvertSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageConvert,
);

server.registerTool(
  "toolkit_image_crop",
  {
    title: "Image Crop",
    description: `Crop an image by explicit region or aspect-ratio preset.

Args:
  - input_path (string): Path to input image
  - output_path (string, optional): output path (default: input_path + '_cropped')
  - left (int, optional): X offset in px (default 0)
  - top (int, optional): Y offset in px (default 0)
  - width (int): crop width in px
  - height (int): crop height in px
  - aspect: 'free' | '1:1' | '4:3' | '16:9' | '9:16' (default 'free'; ignored if width+height given)
  - anchor: 'top-left' | 'center' | 'top-right' | 'bottom-left' | 'bottom-right' (default 'center'; only applies with aspect preset)

Provide width+height, OR set aspect to a non-free preset. Examples:
  - 192x192 from top-left corner: { input_path: "in.jpg", left: 0, top: 0, width: 192, height: 192 }
  - Centered 1:1: { input_path: "in.jpg", aspect: "1:1", anchor: "center" }`,
    inputSchema: CropSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageCrop,
);

server.registerTool(
  "toolkit_image_rotate",
  {
    title: "Image Rotate / Flip",
    description: `Rotate and/or flip an image.

Args:
  - input_path (string): Path to input image
  - output_path (string, optional): output path (default: input_path + '_rotated')
  - degrees (number 0-360, default 0): rotation clockwise
  - flip_horizontal (bool, default false): mirror left-right
  - flip_vertical (bool, default false): mirror top-bottom

Provide degrees != 0, or a flip. Examples:
  - 90° clockwise: { input_path: "in.jpg", degrees: 90 }
  - Mirror horizontally: { input_path: "in.jpg", flip_horizontal: true }
  - 180° + flip vertical: { input_path: "in.jpg", degrees: 180, flip_vertical: true }`,
    inputSchema: RotateSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageRotate,
);

server.registerTool(
  "toolkit_image_filter",
  {
    title: "Image Filter",
    description: `Apply filters and adjustments (brightness, saturation, contrast, blur, grayscale). Apply a named preset, or set individual channels.

Args:
  - input_path (string): Path to input image
  - output_path (string, optional): output path (default: input_path + '_filtered')
  - brightness (0-200): 100 = no change
  - saturation (0-200): 100 = no change, 0 = grayscale
  - contrast (0-200): 100 = no change
  - blur (0-100): blur sigma
  - grayscale (0-100): 100 = full grayscale
  - preset: 'vintage' | 'vivid' | 'black_and_white' | 'cinematic' | 'soft_focus'

Examples:
  - Brighter by 20%: { input_path: "in.jpg", brightness: 120 }
  - Vintage preset: { input_path: "in.jpg", preset: "vintage" }
  - B&W high-contrast: { input_path: "in.jpg", grayscale: 100, contrast: 130 }`,
    inputSchema: FilterSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageFilter,
);

server.registerTool(
  "toolkit_image_effects",
  {
    title: "Image Effects",
    description: `Apply artistic effects and stylizations to images.

Args:
  - input_path (string): Path to input image
  - output_path (string, optional): output path (default: input_path + '_effects')
  - preset (required): 'sepia' | 'vintage' | 'hdr' | 'warm' | 'cool' | 'sketch' | 'emboss'
  - intensity (0-100, default 100): Effect strength percentage

Returns:
  Text summary + structured: { output_path, effect, intensity, original_size_bytes, new_size_bytes }

Examples:
  - Classic sepia: { input_path: "photo.jpg", preset: "sepia" }
  - HDR look: { input_path: "landscape.jpg", preset: "hdr", intensity: 80 }
  - Emboss effect: { input_path: "image.png", preset: "emboss" }`,
    inputSchema: EffectsSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageEffects,
);

server.registerTool(
  "toolkit_image_watermark",
  {
    title: "Image Watermark",
    description: `Add text watermark to images with customizable position, opacity, and styling.

Args:
  - input_path (string): Path to input image
  - output_path (string, optional): output path (default: input_path + '_watermark')
  - text (string, required): Watermark text
  - position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center' (default 'bottom-right')
  - opacity (0-100, default 50): Watermark transparency
  - color (string, default '#ffffff'): Text color in hex format
  - font_size (10-200, default 32): Font size in pixels

Returns:
  Text summary + structured: { output_path, text, position, opacity, color, original_size_bytes, new_size_bytes }

Examples:
  - Copyright notice: { input_path: "photo.jpg", text: "© 2024 My Company", position: "bottom-right", opacity: 70 }
  - Centered draft: { input_path: "document.png", text: "DRAFT", position: "center", opacity: 30, color: "#ff0000" }`,
    inputSchema: WatermarkSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageWatermark,
);

server.registerTool(
  "toolkit_image_extract_colors",
  {
    title: "Extract Colors",
    description: `Extract dominant colors from an image using k-means clustering.

Args:
  - input_path (string): Path to input image
  - count (1-16, default 6): Number of dominant colors to extract
  - format: 'hex' | 'rgb' | 'hsl' | 'all' (default 'all'): Output color format(s)

Returns:
  Text summary + structured: { input_path, color_count, colors (array of ranked colors), image_dimensions, image_format }

Examples:
  - Get 5 dominant colors: { input_path: "design.png", count: 5 }
  - Hex only: { input_path: "palette.jpg", count: 8, format: "hex" }
  - All formats: { input_path: "image.webp", count: 6, format: "all" }`,
    inputSchema: ExtractColorsSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageExtractColors,
);

server.registerTool(
  "toolkit_image_upscale",
  {
    title: "Image Upscale",
    description: `Upscale images with high-quality Lanczos3 interpolation and optional enhancement.

Args:
  - input_path (string): Path to input image
  - output_path (string, optional): output path (default: input_path + '_upscaled')
  - scale: '2x' | '4x' (default '2x'): Upscale factor
  - enhance (bool, default true): Apply sharpening after upscale
  - denoise (bool, default true): Apply denoising before upscale
  - fix_old_photo (bool, default false): Optimize for old/damaged photos (aggressive denoise + moderate sharpen)

Returns:
  Text summary + structured: { output_path, scale, original_dimensions, new_dimensions, enhancements, original_size_bytes, new_size_bytes }

Examples:
  - 2x upscale: { input_path: "small.jpg", scale: "2x" }
  - 4x with enhancement: { input_path: "photo.png", scale: "4x", enhance: true }
  - Old photo restoration: { input_path: "vintage.jpg", scale: "2x", fix_old_photo: true }`,
    inputSchema: UpscaleSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageUpscale,
);

server.registerTool(
  "toolkit_image_bg_remove",
  {
    title: "Remove Background",
    description: `Remove image background using AI-powered segmentation (Hugging Face Transformers).

Args:
  - input_path (string): Path to input image
  - output_path (string, optional): output path (default: input_path + '_nobg.png')
  - threshold (0-1, default 0.5): Segmentation confidence threshold (lower = more aggressive)
  - feather (0-20, default 2): Edge feathering in pixels for smoother compositing
  - invert (bool, default false): Invert to remove the main subject instead of background

Returns:
  Text summary + structured: { output_path, original_dimensions, segments_detected, threshold, feather, original_size_bytes, new_size_bytes, output_format }

Note: First call downloads and caches the AI model (~100MB). Subsequent calls are faster.

Examples:
  - Remove background: { input_path: "product.jpg" }
  - Aggressive removal: { input_path: "person.png", threshold: 0.3, feather: 3 }
  - Remove subject instead: { input_path: "scene.jpg", invert: true }`,
    inputSchema: BgRemoveSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageBgRemove,
);

server.registerTool(
  "toolkit_pdf_merge",
  {
    title: "PDF Merge",
    description: `Merge multiple PDF files into a single document.

Args:
  - input_paths (array of strings, required): Array of PDF file paths to merge (minimum 2)
  - output_path (string, required): Path for merged PDF output

Returns:
  Text summary + structured: { output_path, input_count, total_pages, pages_per_file, output_size_bytes }

Examples:
  - Merge two PDFs: { input_paths: ["doc1.pdf", "doc2.pdf"], output_path: "merged.pdf" }
  - Combine reports: { input_paths: ["report1.pdf", "report2.pdf", "report3.pdf"], output_path: "full-report.pdf" }`,
    inputSchema: PdfMergeSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  pdfMerge,
);

server.registerTool(
  "toolkit_pdf_split",
  {
    title: "PDF Split",
    description: `Split PDF into individual pages or extract specific page ranges.

Args:
  - input_path (string, required): Path to input PDF file
  - output_path (string, required): Base path for output PDFs (will append _page_N.pdf if splitting all pages)
  - pages (string, optional): Page ranges to extract (e.g., '1-3,5,7-9'). If omitted, splits into individual pages

Returns:
  Text summary + structured: { output_path or output_files, extracted_pages or total_pages, output_size_bytes }

Examples:
  - Extract pages 1-3 and 5: { input_path: "doc.pdf", output_path: "extracted.pdf", pages: "1-3,5" }
  - Split all pages: { input_path: "doc.pdf", output_path: "page.pdf" }`,
    inputSchema: PdfSplitSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  pdfSplit,
);

server.registerTool(
  "toolkit_pdf_compress",
  {
    title: "PDF Compress",
    description: `Reduce PDF file size through optimization.

Args:
  - input_path (string, required): Path to input PDF file
  - output_path (string, required): Path for compressed PDF output
  - quality (number, 1-100, default 75): Compression quality. Lower = smaller file

Returns:
  Text summary + structured: { output_path, original_size_bytes, compressed_size_bytes, reduction_percent, quality }

Examples:
  - Compress with default quality: { input_path: "large.pdf", output_path: "compressed.pdf" }
  - Aggressive compression: { input_path: "doc.pdf", output_path: "small.pdf", quality: 50 }`,
    inputSchema: PdfCompressSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  pdfCompress,
);

server.registerTool(
  "toolkit_pdf_ocr",
  {
    title: "PDF OCR",
    description: `Extract text content from PDF files using OCR.

Args:
  - input_path (string, required): Path to input PDF file
  - pages (string, optional): Page ranges to process (e.g., '1-3,5'). If omitted, processes all pages

Returns:
  Text summary + structured: { input_path, pages_processed, total_pages, extracted_text }

Note: First call may be slower as OCR engine initializes.

Examples:
  - Extract all text: { input_path: "scanned.pdf" }
  - Extract specific pages: { input_path: "document.pdf", pages: "1-3,5" }`,
    inputSchema: PdfOcrSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  pdfOcr,
);

server.registerTool(
  "toolkit_pdf_to_image",
  {
    title: "PDF to Image",
    description: `Convert PDF pages to image files.

Args:
  - input_path (string, required): Path to input PDF file
  - output_path (string, required): Base path for output images (will append _page_N.<format>)
  - format: 'png' | 'jpeg' | 'webp' (default 'png'): Output image format
  - pages (string, optional): Page ranges to convert (e.g., '1-3,5'). If omitted, converts all pages
  - scale (number, 1-5, default 2): Render scale factor. Higher = better quality but larger files
  - quality (number, 1-100, default 90): Output quality for JPEG/WebP

Returns:
  Text summary + structured: { output_files, pages_converted, format, scale }

Examples:
  - Convert all pages to PNG: { input_path: "doc.pdf", output_path: "page.png" }
  - Convert first 3 pages to JPEG: { input_path: "doc.pdf", output_path: "page.jpg", pages: "1-3", format: "jpeg" }`,
    inputSchema: PdfToImageSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  pdfToImage,
);

server.registerTool(
  "toolkit_image_to_pdf",
  {
    title: "Image to PDF",
    description: `Convert one or more images to a single PDF document.

Args:
  - input_paths (array of strings, required): Array of image file paths to convert
  - output_path (string, required): Path for output PDF file
  - page_width (number, optional): Page width in points (default: image width)
  - page_height (number, optional): Page height in points (default: image height)
  - margin (number, 0-500, default 0): Page margin in points

Returns:
  Text summary + structured: { output_path, image_count, page_count, output_size_bytes }

Examples:
  - Single image: { input_paths: ["photo.jpg"], output_path: "photo.pdf" }
  - Multiple images: { input_paths: ["img1.png", "img2.jpg"], output_path: "combined.pdf", margin: 36 }`,
    inputSchema: ImageToPdfSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  imageToPdf,
);

server.registerTool(
  "toolkit_pdf_redact",
  {
    title: "PDF Redact",
    description: `Redact sensitive content from PDF files by covering regions with solid rectangles.

Args:
  - input_path (string, required): Path to input PDF file
  - output_path (string, required): Path for redacted PDF output
  - regions (array, required): Array of rectangular regions to redact, each with:
    - page (number): Page number (1-indexed)
    - x (number): X coordinate in points
    - y (number): Y coordinate in points
    - width (number): Width in points
    - height (number): Height in points
  - color (string, default 'black'): Redaction color ('black', 'white', or 'gray')

Returns:
  Text summary + structured: { output_path, redaction_count, output_size_bytes }

Examples:
  - Redact a region: { input_path: "doc.pdf", output_path: "redacted.pdf", regions: [{ page: 1, x: 100, y: 200, width: 300, height: 50 }] }`,
    inputSchema: PdfRedactSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  pdfRedact,
);

server.registerTool(
  "toolkit_file_convert",
  {
    title: "File Convert (Batch)",
    description: `Batch convert image files between formats (JPG, PNG, WebP, AVIF, TIFF).

Args:
  - input_paths (array of strings, required): Array of image file paths to convert
  - output_format (string, required): Target format ('jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff')
  - output_dir (string, required): Output directory for converted files
  - quality (number, 1-100, default 90): Output quality for lossy formats

Returns:
  Text summary + structured: { output_files, file_count, output_format, total_original_size_bytes, total_new_size_bytes, reduction_percent }

Examples:
  - Convert to WebP: { input_paths: ["img1.jpg", "img2.png"], output_format: "webp", output_dir: "./converted" }
  - Batch JPEG conversion: { input_paths: ["*.png"], output_format: "jpg", output_dir: "./output", quality: 85 }`,
    inputSchema: FileConvertSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  fileConvert,
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr only — stdout is the protocol channel.
  console.error("toolkit-mcp-server running via stdio");
  console.error("Phase 1 tools: toolkit_ping, toolkit_image_resize, toolkit_image_compress, toolkit_image_convert, toolkit_image_crop, toolkit_image_rotate, toolkit_image_filter");
  console.error("Phase 2 tools: toolkit_image_effects, toolkit_image_watermark, toolkit_image_extract_colors, toolkit_image_upscale, toolkit_image_bg_remove");
  console.error("Phase 3 tools: toolkit_pdf_merge, toolkit_pdf_split, toolkit_pdf_compress, toolkit_pdf_ocr, toolkit_pdf_to_image, toolkit_image_to_pdf, toolkit_pdf_redact, toolkit_file_convert");
}

main().catch((error) => {
  console.error("Fatal error starting toolkit-mcp-server:", error);
  process.exit(1);
});