import { existsSync, statSync } from "node:fs";
import { readFile, mkdir } from "node:fs/promises";
import { dirname, extname, basename, join } from "node:path";
import { MAX_FILE_SIZE, SUPPORTED_FORMATS } from "../constants.js";
/**
 * Validate that a file exists and is a supported image.
 */
export function validateInputPath(inputPath) {
    if (!existsSync(inputPath)) {
        return { valid: false, error: `File not found: ${inputPath}` };
    }
    const stat = statSync(inputPath);
    if (!stat.isFile()) {
        return { valid: false, error: `Not a file: ${inputPath}` };
    }
    if (stat.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: `File too large: ${(stat.size / 1024 / 1024).toFixed(1)} MB (max ${MAX_FILE_SIZE / 1024 / 1024} MB)`,
        };
    }
    const ext = extname(inputPath).toLowerCase().replace(".", "");
    if (!SUPPORTED_FORMATS.includes(ext)) {
        return {
            valid: false,
            error: `Unsupported format: .${ext}. Supported: ${SUPPORTED_FORMATS.join(", ")}`,
        };
    }
    return { valid: true };
}
/**
 * Generate a default output path by adding a suffix before the extension.
 */
export function defaultOutputPath(inputPath, suffix) {
    const dir = dirname(inputPath);
    const ext = extname(inputPath);
    const name = basename(inputPath, ext);
    return join(dir, `${name}_${suffix}${ext}`);
}
/**
 * Ensure the directory for a file path exists.
 */
export async function ensureDir(filePath) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
    }
}
/**
 * Read a file into a Buffer.
 */
export async function readFileBuffer(path) {
    return readFile(path);
}
/**
 * Get file size in bytes.
 */
export function fileSize(path) {
    return statSync(path).size;
}
/**
 * Format bytes to human-readable string.
 */
export function formatBytes(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
//# sourceMappingURL=file-io.js.map