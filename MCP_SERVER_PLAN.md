# Toolkit MCP Server — Implementation Plan

## Overview

Build a standalone MCP (Model Context Protocol) server that exposes the toolkit's image processing tools to AI agents. The server reimplements tool logic server-side using Node.js libraries (no browser/DOM dependencies).

**Server Name:** `toolkit-mcp-server`
**Transport:** stdio (local)
**Language:** TypeScript
**Entry:** `toolkit-mcp-server/dist/index.js`

---

## Architecture

```
toolkit-mcp-server/
├── package.json
├── tsconfig.json
├── README.md
├── src/
│   ├── index.ts              # Server init, transport selection
│   ├── types.ts              # Shared TypeScript interfaces
│   ├── constants.ts          # Limits, defaults
│   ├── utils/
│   │   ├── file-io.ts        # Read/write file buffers, validate
│   │   ├── image-io.ts       # Load/save images via sharp
│   │   └── error-handling.ts # Consistent error responses
│   └── tools/
│       ├── image-resize.ts   # Bulk Image Resizer
│       ├── image-compress.ts # Smart Compressor
│       ├── image-convert.ts  # Image Converter (JPG↔PNG↔WebP↔AVIF)
│       ├── image-crop.ts     # Image Cropper
│       ├── image-rotate.ts   # Image Rotator
│       ├── image-filter.ts   # Image Filter Editor
│       ├── image-effects.ts  # Image Effects (sepia, vintage, etc.)
│       ├── image-watermark.ts# Watermark Tool
│       ├── image-upscale.ts  # Image Upscaler
│       ├── image-extract-colors.ts # Color Palette Extractor
│       ├── image-bg-remove.ts# BG Remover
│       └── index.ts          # Tool registry (exports all tools)
└── dist/                     # Compiled output
```

### Key Dependencies

| Package | Purpose | Replaces |
|---------|---------|----------|
| `sharp` | Image resize, compress, convert, filter, effects, metadata | Canvas API |
| `@modelcontextprotocol/sdk` | MCP protocol | — |
| `zod` | Input validation | — |
| `onnxruntime-node` | AI model inference (BG remover, upscaler) | `onnxruntime-web` |

---

## Tool Inventory — Image Tools (13 tools)

Each tool maps to a `toolkit_{action}` MCP tool name with snake_case.

### Phase 1: Core Tools (Week 1) — 6 tools

| # | MCP Tool Name | Source | Description | Complexity |
|---|---------------|--------|-------------|------------|
| 1 | `toolkit_image_resize` | `app/images/resizer/` | Resize by px/%/preset, aspect lock | Low |
| 2 | `toolkit_image_compress` | `app/images/compressor/` | Quality/compression, WebP output | Low |
| 3 | `toolkit_image_convert` | `app/images/converter/` | JPG↔PNG↔WebP↔AVIF conversion | Low |
| 4 | `toolkit_image_crop` | `app/images/cropper/` | Crop with aspect ratio presets | Medium |
| 5 | `toolkit_image_rotate` | `app/images/rotator/` | Rotate (degrees) + flip H/V | Low |
| 6 | `toolkit_image_filter` | `app/images/filter/` | Brightness, contrast, saturation, blur, grayscale, presets | Medium |

### Phase 2: Advanced Tools (Week 2) — 5 tools

| # | MCP Tool Name | Source | Description | Complexity |
|---|---------------|--------|-------------|------------|
| 7 | `toolkit_image_effects` | `app/images/effects/` | Sepia, vintage, HDR, warm, cool, sketch, emboss | Medium |
| 8 | `toolkit_image_watermark` | `app/images/watermark/` | Text watermark with position/opacity/color | Medium |
| 9 | `toolkit_image_extract_colors` | `app/images/extractor/` | Extract dominant colors as HEX/RGB/HSL | Medium |
| 10 | `toolkit_image_upscale` | `app/images/upscaler/` | 2x/4x upscale with old photo fix | High |
| 11 | `toolkit_image_bg_remove` | `app/images/remover/` | AI background removal | High |

### Phase 3: PDF & File Tools (Week 3+)

| # | MCP Tool Name | Source | Description |
|---|---------------|--------|-------------|
| 12 | `toolkit_pdf_merge` | `app/pdf/merge/` | Combine multiple PDFs |
| 13 | `toolkit_pdf_split` | `app/pdf/split/` | Extract pages/ranges |
| 14 | `toolkit_pdf_compress` | `app/pdf/compress/` | Reduce file size |
| 15 | `toolkit_pdf_ocr` | `app/pdf/ocr/` | Extract text from PDF |
| 16 | `toolkit_pdf_to_image` | `app/pdf/to-image/` | PDF pages → PNG/JPG/WebP |
| 17 | `toolkit_image_to_pdf` | `app/pdf/image-to-pdf/` | Images → PDF |
| 18 | `toolkit_pdf_redact` | `app/pdf/redact/` | Redact sensitive info |
| 19 | `toolkit_file_convert` | `app/files/` | JPG↔PNG↔WebP↔HEIC↔AVIF batch |

---

## Tool Design Patterns

### Input Schema Pattern

Every tool accepts file paths (not raw binary) — agents write files to disk, then pass paths:

```typescript
// Example: image_resize
const ImageResizeSchema = z.object({
  input_path: z.string()
    .describe("Path to input image file (JPG, PNG, WebP, AVIF)"),
  output_path: z.string()
    .optional()
    .describe("Path for output file. Defaults to input_path with '_resized' suffix"),
  width: z.number().int().min(1).max(16384).optional()
    .describe("Target width in pixels"),
  height: z.number().int().min(1).max(16384).optional()
    .describe("Target height in pixels"),
  scale_percent: z.number().min(1).max(1000).optional()
    .describe("Scale by percentage (e.g., 50 = half size)"),
  preset: z.enum(["social", "web", "print", "thumbnail"]).optional()
    .describe("Quick preset: social=1080x1080, web=1200x800, print=2400x1800, thumbnail=300x200"),
  maintain_aspect: z.boolean().default(true)
    .describe("Maintain aspect ratio when resizing"),
  quality: z.number().int().min(1).max(100).default(90)
    .describe("Output quality (1-100)")
}).strict();
```

### Output Pattern

Every tool returns:
1. **Text content**: Human-readable summary with dimensions, file size, output path
2. **Structured content**: JSON with all metadata

```typescript
return {
  content: [{
    type: "text",
    text: `Resized image saved to ${outputPath}\nDimensions: ${origW}x${origH} → ${newW}x${newH}\nSize: ${formatBytes(inputSize)} → ${formatBytes(outputSize)}`
  }],
  structuredContent: {
    success: true,
    output_path: outputPath,
    original_dimensions: { width: origW, height: origH },
    new_dimensions: { width: newW, height: newH },
    original_size_bytes: inputSize,
    new_size_bytes: outputSize,
    format: outputFormat
  }
};
```

### Annotations

All tools use:
- `readOnlyHint: false` — they write output files
- `destructiveHint: false` — input files are not modified
- `idempotentHint: true` — same input + params = same output
- `openWorldHint: false` — local filesystem only

---

## Tool Specifications (Phase 1 — Image Tools)

### 1. `toolkit_image_resize`

Resize images by pixels, percentage, or preset dimensions.

**Sharp API:** `sharp(input).resize({ width, height, fit, withoutEnlargement })`

**Presets:**
- `social`: 1080×1080
- `web`: 1200×800
- `print`: 2400×1800
- `thumbnail`: 300×200

### 2. `toolkit_image_compress`

Compress images with quality control and optional WebP conversion.

**Sharp API:** `sharp(input).jpeg({ quality }).toFile(output)` or `.webp({ quality })`

**Presets:**
- `web_optimized`: quality=80, WebP
- `email`: quality=60, max_width=800
- `social_media`: quality=85, max_width=1080
- `thumbnail`: quality=70, max_width=300

### 3. `toolkit_image_convert`

Convert between image formats (JPEG, PNG, WebP, AVIF).

**Sharp API:** `sharp(input).png().toFile(output)` etc.

### 4. `toolkit_image_crop`

Crop images with aspect ratio presets or custom dimensions.

**Sharp API:** `sharp(input).extract({ left, top, width, height })`

**Aspect presets:** `free`, `1:1`, `4:3`, `16:9`, `9:16`

### 5. `toolkit_image_rotate`

Rotate by degrees and/or flip horizontally/vertically.

**Sharp API:** `sharp(input).rotate(degrees, { flip, flop })`

**Quick rotations:** 90, 180, 270 degrees

### 6. `toolkit_image_filter`

Apply brightness, contrast, saturation, blur, grayscale adjustments and named presets.

**Sharp API:** `sharp(input).modulate({ brightness, saturation }).blur(sigma)` + gamma for contrast

**Named presets:** `vintage`, `vivid`, `black_and_white`, `cinematic`, `soft_focus`

Filter logic (adapted from `app/images/filter/page.tsx`):
- Brightness: `sharp.modulate({ brightness: value / 100 })`
- Contrast: via gamma adjustment `sharp.gamma(1 / contrastFactor)`
- Saturation: `sharp.modulate({ saturation: value / 100 })`
- Blur: `sharp.blur(sigma)`
- Grayscale: `sharp.grayscale()` + modulate blend

---

## Phase 1 Implementation Steps

### Step 1: Project Setup
1. Create `toolkit-mcp-server/` directory
2. Initialize `package.json` with dependencies
3. Create `tsconfig.json` with strict mode
4. Create `src/index.ts` with McpServer init + stdio transport

### Step 2: Validate MCP Works (Smoke Test)
1. Register a single trivial tool (`toolkit_ping`)
2. Build with `npm run build`
3. Test with `npx @modelcontextprotocol/inspector`
4. Verify the inspector can list and call the tool

### Step 3: Build Core Utilities
1. `src/utils/file-io.ts` — read/write files, validate paths exist
2. `src/utils/image-io.ts` — load image metadata with sharp
3. `src/utils/error-handling.ts` — consistent error formatting
4. `src/constants.ts` — max file size, supported formats

### Step 4: Implement Phase 1 Tools (one by one)
For each tool:
1. Create `src/tools/image-{name}.ts`
2. Define Zod input schema
3. Implement using sharp
4. Register in `src/tools/index.ts`
5. Test with MCP Inspector
6. Verify output files are correct

Order: resize → compress → convert → crop → rotate → filter

### Step 5: Integration Testing
1. Test all 6 tools via MCP Inspector
2. Test edge cases (invalid paths, unsupported formats, oversized files)
3. Verify `npm run build` passes with zero errors

---

## Testing Strategy

### MCP Inspector Test
```bash
cd toolkit-mcp-server
npm run build
npx @modelcontextprotocol/inspector node dist/index.js
```

### Manual Test Script
For each tool, create a test image and verify:
```bash
# Generate test image
convert -size 800x600 xc:red /tmp/test.jpg

# Test via MCP Inspector → call toolkit_image_resize
# Verify output: file exists, correct dimensions, non-zero size
```

---

## Client Configuration

Users add this to their MCP client config (e.g., Claude Desktop):

```json
{
  "mcpServers": {
    "toolkit": {
      "command": "node",
      "args": ["/path/to/toolkit-mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

---

## Future Phases

### Phase 2: Advanced Image Tools
- Effects (sharp pipeline compositing for sepia/vintage/HDR)
- Watermark (sharp composite with text overlay via canvas-node or SVG)
- Color extraction (sharp stats + k-means clustering)
- Upscale (sharp resize with lanczos3 kernel, or ONNX super-resolution model)
- BG Removal (ONNX model with onnxruntime-node)

### Phase 3: PDF & File Tools
- PDF tools using `pdf-lib` and `pdfjs-dist`
- File converters using sharp for image formats

### Phase 4: Polish
- Comprehensive README with examples
- Package for npm/npx
- MCP Registry submission
- Evaluation suite
