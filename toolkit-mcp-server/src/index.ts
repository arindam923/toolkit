#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import {
  ImageResizeSchema,
  imageResize,
  ImageCompressSchema,
  imageCompress,
  ImageConvertSchema,
  imageConvert,
  ImageCropSchema,
  imageCrop,
  ImageRotateSchema,
  imageRotate,
  ImageFilterSchema,
  imageFilter,
} from "./tools/index.js";

const server = new McpServer({
  name: "toolkit-mcp-server",
  version: "1.0.0",
});

// ─────────────────────────────────────────────
// Health check
// ─────────────────────────────────────────────
server.registerTool(
  "toolkit_ping",
  {
    title: "Ping Toolkit",
    description:
      "Health check tool. Returns a pong response to verify the MCP server is running.",
    inputSchema: {
      message: z
        .string()
        .optional()
        .describe("Optional message to echo back"),
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async ({ message }) => {
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              status: "ok",
              server: "toolkit-mcp-server",
              version: "1.0.0",
              timestamp: new Date().toISOString(),
              echo: message ?? null,
              tools_available: 7,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

// ─────────────────────────────────────────────
// Image Tools
// ─────────────────────────────────────────────

const TOOL_ANNOTATIONS = {
  readOnlyHint: false,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

server.registerTool(
  "toolkit_image_resize",
  {
    title: "Image Resize",
    description:
      "Resize images by pixels, percentage, or preset dimensions (social/web/print/thumbnail). Supports JPG, PNG, WebP, AVIF.",
    inputSchema: ImageResizeSchema.shape,
    annotations: TOOL_ANNOTATIONS,
  },
  async (params) => imageResize(ImageResizeSchema.parse(params)),
);

server.registerTool(
  "toolkit_image_compress",
  {
    title: "Image Compress",
    description:
      "Compress images with quality control and optional WebP conversion. Presets available for web, email, social media, and thumbnails.",
    inputSchema: ImageCompressSchema.shape,
    annotations: TOOL_ANNOTATIONS,
  },
  async (params) => imageCompress(ImageCompressSchema.parse(params)),
);

server.registerTool(
  "toolkit_image_convert",
  {
    title: "Image Convert",
    description:
      "Convert images between formats: JPEG, PNG, WebP, and AVIF.",
    inputSchema: ImageConvertSchema.shape,
    annotations: TOOL_ANNOTATIONS,
  },
  async (params) => imageConvert(ImageConvertSchema.parse(params)),
);

server.registerTool(
  "toolkit_image_crop",
  {
    title: "Image Crop",
    description:
      "Crop images by custom dimensions or aspect ratio presets (1:1, 4:3, 16:9, 9:16). Supports centered or offset crops.",
    inputSchema: ImageCropSchema.shape,
    annotations: TOOL_ANNOTATIONS,
  },
  async (params) => imageCrop(ImageCropSchema.parse(params)),
);

server.registerTool(
  "toolkit_image_rotate",
  {
    title: "Image Rotate & Flip",
    description:
      "Rotate images by any angle and/or flip horizontally/vertically. Quick 90°/180°/270° rotations supported.",
    inputSchema: ImageRotateSchema.shape,
    annotations: TOOL_ANNOTATIONS,
  },
  async (params) => imageRotate(ImageRotateSchema.parse(params)),
);

server.registerTool(
  "toolkit_image_filter",
  {
    title: "Image Filter Editor",
    description:
      "Apply filters and adjustments to images: brightness, contrast, saturation, blur, grayscale. Named presets: vintage, vivid, black_and_white, cinematic, soft_focus.",
    inputSchema: ImageFilterSchema.shape,
    annotations: TOOL_ANNOTATIONS,
  },
  async (params) => imageFilter(ImageFilterSchema.parse(params)),
);

// ─────────────────────────────────────────────
// Start server
// ─────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("toolkit-mcp-server running via stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
