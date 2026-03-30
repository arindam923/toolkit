export interface ImageMetadata {
    width: number;
    height: number;
    format: string;
    channels: number;
    hasAlpha: boolean;
    size: number;
}
/**
 * Get image metadata using sharp.
 */
export declare function getImageMetadata(inputPath: string): Promise<ImageMetadata>;
/**
 * Get the output extension for a format.
 */
export declare function formatToExt(format: string): string;
//# sourceMappingURL=image-io.d.ts.map