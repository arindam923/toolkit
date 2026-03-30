/**
 * Validate that a file exists and is a supported image.
 */
export declare function validateInputPath(inputPath: string): {
    valid: boolean;
    error?: string;
};
/**
 * Generate a default output path by adding a suffix before the extension.
 */
export declare function defaultOutputPath(inputPath: string, suffix: string): string;
/**
 * Ensure the directory for a file path exists.
 */
export declare function ensureDir(filePath: string): Promise<void>;
/**
 * Read a file into a Buffer.
 */
export declare function readFileBuffer(path: string): Promise<Buffer>;
/**
 * Get file size in bytes.
 */
export declare function fileSize(path: string): number;
/**
 * Format bytes to human-readable string.
 */
export declare function formatBytes(bytes: number): string;
//# sourceMappingURL=file-io.d.ts.map