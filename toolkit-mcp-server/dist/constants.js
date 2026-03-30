/** Maximum input file size: 50 MB */
export const MAX_FILE_SIZE = 50 * 1024 * 1024;
/** Supported image input formats */
export const SUPPORTED_FORMATS = [
    "jpeg",
    "jpg",
    "png",
    "webp",
    "avif",
    "tiff",
    "gif",
];
/** Format to MIME type mapping */
export const FORMAT_MIME = {
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
    tiff: "image/tiff",
    gif: "image/gif",
};
/** Resize presets (width x height) */
export const RESIZE_PRESETS = {
    social: { width: 1080, height: 1080 },
    web: { width: 1200, height: 800 },
    print: { width: 2400, height: 1800 },
    thumbnail: { width: 300, height: 200 },
};
/** Compress presets */
export const COMPRESS_PRESETS = {
    web_optimized: { quality: 80, maxWidth: 1200, format: "webp" },
    email: { quality: 60, maxWidth: 800 },
    social_media: { quality: 85, maxWidth: 1080 },
    thumbnail: { quality: 70, maxWidth: 300 },
};
//# sourceMappingURL=constants.js.map