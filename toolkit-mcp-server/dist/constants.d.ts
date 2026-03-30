/** Maximum input file size: 50 MB */
export declare const MAX_FILE_SIZE: number;
/** Supported image input formats */
export declare const SUPPORTED_FORMATS: readonly ["jpeg", "jpg", "png", "webp", "avif", "tiff", "gif"];
export type SupportedFormat = (typeof SUPPORTED_FORMATS)[number];
/** Format to MIME type mapping */
export declare const FORMAT_MIME: Record<string, string>;
/** Resize presets (width x height) */
export declare const RESIZE_PRESETS: Record<string, {
    width: number;
    height: number;
}>;
/** Compress presets */
export declare const COMPRESS_PRESETS: Record<string, {
    quality: number;
    maxWidth?: number;
    format?: string;
}>;
//# sourceMappingURL=constants.d.ts.map