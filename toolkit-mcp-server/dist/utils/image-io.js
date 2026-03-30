import sharp from "sharp";
/**
 * Get image metadata using sharp.
 */
export async function getImageMetadata(inputPath) {
    const meta = await sharp(inputPath).metadata();
    const { statSync } = await import("node:fs");
    const size = statSync(inputPath).size;
    return {
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        format: meta.format ?? "unknown",
        channels: meta.channels ?? 3,
        hasAlpha: meta.hasAlpha ?? false,
        size,
    };
}
/**
 * Get the output extension for a format.
 */
export function formatToExt(format) {
    const map = {
        jpeg: ".jpg",
        jpg: ".jpg",
        png: ".png",
        webp: ".webp",
        avif: ".avif",
        tiff: ".tiff",
        gif: ".gif",
    };
    return map[format.toLowerCase()] ?? `.${format}`;
}
//# sourceMappingURL=image-io.js.map