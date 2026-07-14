# What We Have — Toolkit Repo Snapshot

A browser-based utility suite ("Toolkit") for PDF, image, file, and security processing. Next.js 16 App Router + React 19 + Tailwind v4. Most tools run client-side (Canvas/WebAssembly/ONNX); a few call Gemini server-side via API routes.

## Stack
- **Framework:** Next.js 16.1.6 (App Router), React 19.2, TypeScript (strict via tsconfig), Tailwind v4
- **Animation:** `motion` (Framer Motion successor)
- **Icons:** `lucide-react`
- **Image/AI libs:** `@huggingface/transformers`, `@xenova/transformers`, `onnxruntime-web`, `upscaler` + `@upscalerjs/esrgan-*` (upscaling), `@websr/websr` (super-resolution)
- **PDF libs:** `pdfjs-dist`, `pdf-lib`, legacy `pdf` package
- **Misc:** `jszip` (batch zips), `browser-image-compression`
- **State:** only `hooks/useTheme.ts`; no global store
- **No backend DB** — server routes are thin proxies to Gemini

## Directory Layout
```
app/
  page.tsx                  # Home (searchable tool registry, sidebar nav, dark mode)
  layout.tsx, globals.css
  images/    (13 tool routes + components/ + tools/)
  pdf/       (10 tool routes + components/ + tools/)
  files/     (converter hub + standalone format routes + tools/)
  security/  (6 routes)
  text/      (7 routes)
  lib/       gemini-image-service.ts, restoration-service.ts, upscaler-service.ts
  api/       design-system-generator/route.ts, images/gemini-edit/route.ts
components/  home/, images/, pdf/, files/, security/, shared/
data/       files.tsx (source of truth for registry), pdf.ts, images.ts, security.ts
hooks/      useTheme.ts
MCP_SERVER_PLAN.md          # Plan for standalone MCP server (NOT yet built — in .gitignore)
```

## Implementec Tools (have routes)

### Images — 13 routes
Compressor, Converter, Cropper, Design System Generator (Beta, Gemini-backed), Effects, Color Palette Extractor, Filter Editor, Metadata Editor, BG Remover (AI, RMBG-1.4, Pro), Bulk Resizer, Rotator, Upscaler (AI, Beta, Pro), Watermark.

### PDF — 10 routes
Annotator (Beta), Compress, Convert (PDF→Word, Stable), Image-to-PDF, Merge, OCR (Beta, Pro), Redact, Security (Lock/Unlock — unlock only; lock "coming soon"), Split, To-Image.

### Files — converter hub + standalone pages
Unified `/files/converter` plus legacy per-format pages: avif-to-jpg, heic-to-jpg, jpg-to-png, png-to-jpg, png-to-webp, webp-to-png, docx-to-pdf (coming soon per data), pdf-to-docx (coming soon per data).

### Security — 6 routes
File Encrypt/Decrypt (AES-256-GCM), Hash Generator (SHA-256/512, MD5, SHA-1), Password Generator, Random Generator, Security Scanner, Text Encrypt/Decrypt.

### Text & Data — 7 routes
JSON Format, Word Count, CSV→JSON, Text Diff, Markdown→HTML, HTML→Markdown, Text Minifier.

## Registry Source of Truth
`data/files.tsx` → exports `TOOLS` (full registry with `mcpAvailable`, `isPaid`, `status` flags), `CATEGORIES`, `fileTools`, `badges`. Home page (`app/page.tsx`) imports `TOOLS`/`CATEGORIES` from here.

## Work in Progress
- **MCP Server** (`MCP_SERVER_PLAN.md`): planned standalone TypeScript stdio server exposing image tools to AI agents via `@modelcontextprotocol/sdk`. Phased: 6 image tools → 5 advanced → PDF/file tools. Not yet created — directory is in `.gitignore`. The `mcpAvailable: true` flags on tools indicate intended coverage (~30 of 44 marked).

## Summary
~51 tools registered, 46 with working routes (13 image + 10 PDF + 9 file + 7 security + 7 text). MCP server planned but unbuilt.