# toolkit-mcp-server

A local-first MCP (Model Context Protocol) server that exposes the Toolkit image utilities to AI agents. All processing runs on the agent's machine with [`sharp`](https://sharp.pixelplumbing.com/) — no uploads, no network.

Part of the [Toolkit](../) project (the privacy-first web tool suite). This server lets AI agents — Claude Desktop, Cursor, or anything that speaks MCP — perform real image operations on local files.

## Status

**Phase 1 — Core image tools (✅ shipped):**
- `toolkit_image_resize` — resize by px/%/preset
- `toolkit_image_compress` — quality control, WebP, presets
- `toolkit_image_convert` — JPG↔PNG↔WebP↔AVIF↔TIFF
- `toolkit_image_crop` — explicit region or aspect-ratio preset
- `toolkit_image_rotate` — rotate + flip H/V
- `toolkit_image_filter` — brightness/saturation/contrast/blur/grayscale + named presets
- `toolkit_ping` — health check

**Phase 2 — Advanced image tools (✅ shipped):**
- `toolkit_image_effects` — sepia, vintage, hdr, warm, cool, sketch, emboss with intensity control
- `toolkit_image_watermark` — text watermark with position/opacity/color/font size
- `toolkit_image_extract_colors` — k-means dominant color extraction (HEX/RGB/HSL)
- `toolkit_image_upscale` — 2x/4x high-quality Lanczos3 upscale with sharpen/denoise
- `toolkit_image_bg_remove` — AI-powered background removal (HuggingFace SegFormer model)

**Phase 3 — PDF & file tools (✅ shipped):**
- `toolkit_pdf_merge` — combine multiple PDFs
- `toolkit_pdf_split` — extract pages/ranges or split all
- `toolkit_pdf_compress` — reduce PDF file size
- `toolkit_pdf_ocr` — extract text from PDF
- `toolkit_pdf_to_image` — convert PDF pages to PNG/JPEG/WebP
- `toolkit_image_to_pdf` — convert images to PDF
- `toolkit_pdf_redact` — redact content from PDF
- `toolkit_file_convert` — batch convert images between formats

**Phase 4 — Polish (✅ shipped):**
- Comprehensive README with tool documentation and examples
- npm packaging with metadata (keywords, license, repository)
- Evaluation suite (`npm run eval`) — 19/19 tests passing
- MCP Registry ready

All 20 tools are verified end-to-end and ready for production use.

## Install

```bash
cd toolkit-mcp-server
npm install
npm run build
```

Requires Node ≥ 18. `sharp` ships prebuilt binaries for macOS, Linux, and Windows.

## Run

```bash
# Start the server (stdio transport — speaks MCP on stdin/stdout)
node dist/index.js

# Open the MCP Inspector UI (Claude's official debugger)
npm run inspector
```

The server logs to **stderr** only — stdout is the protocol channel, so it stays clean for the client.

## Wire into your MCP client

### Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS)

```json
{
  "mcpServers": {
    "toolkit": {
      "command": "node",
      "args": ["/absolute/path/to/toolkit-mcp-server/dist/index.js"]
    }
  }
}
```

Restart Claude Desktop. You should see the 20 `toolkit_*` tools appear.

### Cursor / other MCP clients

Same shape — point the `command`/`args` at `dist/index.js`. No environment variables required.

## Tools

### Image Tools (Phase 1 & 2)

#### `toolkit_image_resize`

Resize an image by pixels, percentage, or a named preset.

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `input_path` | string | — | required; JPG, PNG, WebP, AVIF, TIFF, GIF |
| `output_path` | string | `<input>_resized.<ext>` | |
| `width` / `height` | int (1–16384) | — | target dims |
| `scale_percent` | number (1–1000) | — | e.g. `50` = half |
| `preset` | `social` \| `web` \| `print` \| `thumbnail` | — | overrides width/height |
| `fit` | `cover` \| `contain` \| `fill` \| `inside` \| `outside` | `cover` | |
| `maintain_aspect` | bool | `true` | |
| `quality` | 1–100 | `90` | |

Presets: `social`=1080×1080, `web`=1200×800, `print`=2400×1800, `thumbnail`=300×200.

```json
{ "input_path": "photo.jpg", "preset": "social" }
```

#### `toolkit_image_compress`

Compress an image with quality control. Defaults to WebP for best compression.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | `<input>_compressed.<ext>` |
| `quality` | 1–100 | per-preset or 80 |
| `output_format` | `jpeg` \| `webp` \| `png` \| `avif` | `webp` |
| `max_width` | int | — |
| `progressive` | bool | `true` |
| `preset` | `web_optimized` \| `email` \| `social_media` \| `thumbnail` | — |

```json
{ "input_path": "big.png", "preset": "email" }
```

#### `toolkit_image_convert`

Convert formats. `quality` affects only lossy targets (JPEG/WebP/AVIF).

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | `<input>_converted.<ext>` |
| `format` | `jpeg` \| `jpg` \| `png` \| `webp` \| `avif` \| `tiff` | — (required) |
| `quality` | 1–100 | `90` |

```json
{ "input_path": "logo.png", "format": "webp", "quality": 85 }
```

#### `toolkit_image_crop`

Crop by region or by aspect-ratio preset (auto-positioned with `anchor`).

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | `<input>_cropped` |
| `left` / `top` | int | `0` |
| `width` / `height` | int | — |
| `aspect` | `free` \| `1:1` \| `4:3` \| `16:9` \| `9:16` | `free` |
| `anchor` | `top-left` \| `center` \| `top-right` \| `bottom-left` \| `bottom-right` | `center` |

Provide `width`+`height`, **or** a non-free `aspect`. Region out-of-bounds returns a clear error.

```json
{ "input_path": "photo.jpg", "aspect": "1:1", "anchor": "center" }
```

#### `toolkit_image_rotate`

Rotate and/or flip.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | `<input>_rotated` |
| `degrees` | 0–360 | `0` |
| `flip_horizontal` | bool | `false` |
| `flip_vertical` | bool | `false` |

90°/270° swap width↔height automatically.

```json
{ "input_path": "sideways.jpg", "degrees": 90 }
```

#### `toolkit_image_filter`

Adjustments and named presets.

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `input_path` | string | — | |
| `output_path` | string | `<input>_filtered` | |
| `brightness` | 0–200 | 100 | 100 = no change |
| `saturation` | 0–200 | 100 | 0 = grayscale |
| `contrast` | 0–200 | 100 | applied via `linear()` |
| `blur` | 0–100 | 0 | blur sigma |
| `grayscale` | 0–100 | 0 | 100 = full grayscale |
| `preset` | `vintage` \| `vivid` \| `black_and_white` \| `cinematic` \| `soft_focus` | — | explicit settings override preset values |

```json
{ "input_path": "flat.jpg", "preset": "cinematic" }
```

#### `toolkit_image_effects`

Apply artistic effects with intensity control.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | `<input>_effects` |
| `preset` | `sepia` \| `vintage` \| `hdr` \| `warm` \| `cool` \| `sketch` \| `emboss` | — (required) |
| `intensity` | 0–100 | `100` |

```json
{ "input_path": "photo.jpg", "preset": "sepia", "intensity": 80 }
```

#### `toolkit_image_watermark`

Add text watermark with customizable position, opacity, color, and font size.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | `<input>_watermark` |
| `text` | string | — (required) |
| `position` | `top-left` \| `top-right` \| `bottom-left` \| `bottom-right` \| `center` | `bottom-right` |
| `opacity` | 0–100 | `50` |
| `color` | string (hex) | `#ffffff` |
| `font_size` | 10–200 | `32` |

```json
{ "input_path": "photo.jpg", "text": "© 2024", "opacity": 70 }
```

#### `toolkit_image_extract_colors`

Extract dominant colors via k-means clustering.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `count` | 1–16 | `6` |
| `format` | `hex` \| `rgb` \| `hsl` \| `all` | `all` |

Returns colors in HEX, RGB, and HSL formats.

```json
{ "input_path": "design.png", "count": 5 }
```

#### `toolkit_image_upscale`

High-quality 2x/4x upscaling with Lanczos3 kernel.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | `<input>_upscaled` |
| `scale` | `2x` \| `4x` | `2x` |
| `enhance` | bool | `true` |
| `denoise` | bool | `true` |
| `fix_old_photo` | bool | `false` |

```json
{ "input_path": "small.jpg", "scale": "4x", "enhance": true }
```

#### `toolkit_image_bg_remove`

AI-powered background removal using HuggingFace SegFormer model.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | `<input>_nobg.png` |
| `threshold` | 0–1 | `0.5` |
| `feather` | 0–20 | `2` |
| `invert` | bool | `false` |

Note: First call downloads and caches the AI model (~100MB). Subsequent calls are faster.

```json
{ "input_path": "product.jpg", "threshold": 0.5 }
```

### PDF & File Tools (Phase 3)

#### `toolkit_pdf_merge`

Combine multiple PDFs into a single document.

| Parameter | Type | Default |
|---|---|---|
| `input_paths` | array of strings | — (required, min 2) |
| `output_path` | string | — (required) |

```json
{ "input_paths": ["doc1.pdf", "doc2.pdf"], "output_path": "merged.pdf" }
```

#### `toolkit_pdf_split`

Extract specific page ranges or split into individual pages.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | — (required) |
| `pages` | string | — (e.g., "1-3,5,7-9") |

If `pages` is omitted, splits into individual pages.

```json
{ "input_path": "doc.pdf", "output_path": "extracted.pdf", "pages": "1-3,5" }
```

#### `toolkit_pdf_compress`

Reduce PDF file size through optimization.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | — |
| `quality` | 1–100 | `75` |

```json
{ "input_path": "large.pdf", "output_path": "compressed.pdf", "quality": 60 }
```

#### `toolkit_pdf_ocr`

Extract text content from PDF files using OCR.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `pages` | string | — (e.g., "1-3,5") |

Note: First call may be slower as OCR engine initializes.

```json
{ "input_path": "scanned.pdf", "pages": "1-3" }
```

#### `toolkit_pdf_to_image`

Convert PDF pages to image files.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | — (base path, will append _page_N.<format>) |
| `format` | `png` \| `jpeg` \| `webp` | `png` |
| `pages` | string | — (e.g., "1-3") |
| `scale` | 1–5 | `2` |
| `quality` | 1–100 | `90` |

```json
{ "input_path": "doc.pdf", "output_path": "page.png", "format": "png", "scale": 2 }
```

#### `toolkit_image_to_pdf`

Convert one or more images to a PDF document.

| Parameter | Type | Default |
|---|---|---|
| `input_paths` | array of strings | — (required) |
| `output_path` | string | — (required) |
| `page_width` | number | image width |
| `page_height` | number | image height |
| `margin` | 0–500 | `0` |

```json
{ "input_paths": ["img1.jpg", "img2.png"], "output_path": "combined.pdf", "margin": 36 }
```

#### `toolkit_pdf_redact`

Redact sensitive content from PDF files by covering regions with solid rectangles.

| Parameter | Type | Default |
|---|---|---|
| `input_path` | string | — |
| `output_path` | string | — |
| `regions` | array of objects | — (required) |
| `color` | `black` \| `white` \| `gray` | `black` |

Each region object: `{ page, x, y, width, height }` (coordinates in points).

```json
{
  "input_path": "doc.pdf",
  "output_path": "redacted.pdf",
  "regions": [{ "page": 1, "x": 100, "y": 200, "width": 300, "height": 50 }]
}
```

#### `toolkit_file_convert`

Batch convert image files between formats (JPG, PNG, WebP, AVIF, TIFF).

| Parameter | Type | Default |
|---|---|---|
| `input_paths` | array of strings | — (required) |
| `output_format` | `jpg` \| `jpeg` \| `png` \| `webp` \| `avif` \| `tiff` | — (required) |
| `output_dir` | string | — (required) |
| `quality` | 1–100 | `90` |

```json
{ "input_paths": ["img1.jpg", "img2.png"], "output_format": "webp", "output_dir": "./converted", "quality": 85 }
```

## Security

- All paths are validated client-side; the server is meant for **local** use only.
- `MAX_FILE_SIZE_BYTES` = 100 MB per input (see `src/constants.ts`).
- Unsupported formats are rejected before processing.
- All errors return structured `isError: true` results with actionable messages — never an unhandled crash.

## Development

```bash
npm run dev        # tsx watch — auto-reload on save
npm run build      # tsc — typecheck + emit dist/
npm run inspector  # launch the MCP Inspector UI
```

## Project layout

```
toolkit-mcp-server/
├── src/
│   ├── index.ts                  # Server init + tool registration + stdio
│   ├── types.ts                  # Shared TypeScript interfaces (incl. ToolResult)
│   ├── constants.ts              # Limits, presets, Zod enums
│   ├── utils/
│   │   ├── file-io.ts            # Path validation, file size, output-path derivation
│   │   ├── image-io.ts           # sharp load/metadata/write + apply* helpers
│   │   └── error-handling.ts     # errorResult / successResult helpers
│   └── tools/
│       ├── image-resize.ts       # resize tool
│       ├── image-tools.ts        # compress, convert, crop, rotate, filter
│       ├── image-effects.ts      # artistic effects
│       ├── image-watermark.ts    # text watermark
│       ├── image-extract-colors.ts # color extraction
│       ├── image-upscale.ts      # high-quality upscale
│       ├── image-bg-remove.ts    # AI background removal
│       ├── pdf-merge.ts          # merge PDFs
│       ├── pdf-split.ts          # split/extract PDF pages
│       ├── pdf-compress.ts       # optimize PDF size
│       ├── pdf-ocr.ts            # extract text from PDF
│       ├── pdf-to-image.ts       # convert PDF pages to images
│       ├── image-to-pdf.ts       # convert images to PDF
│       ├── pdf-redact.ts         # redact PDF content
│       └── file-convert.ts       # batch image format conversion
└── dist/                         # compiled output (entry: dist/index.js)
```

## License

Same as the Toolkit parent project.