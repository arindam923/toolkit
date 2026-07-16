import { promises as fs } from "node:fs";
import path from "node:path";

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function getFileSize(filePath: string): Promise<number> {
  const stat = await fs.stat(filePath);
  return stat.size;
}

export async function ensureDir(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function deriveOutputPath(
  inputPath: string,
  suffix: string,
  extension?: string,
): string {
  const parsed = path.parse(inputPath);
  const ext = extension ? `.${extension}` : parsed.ext;
  return path.join(parsed.dir, `${parsed.base.replace(parsed.ext, "")}${suffix}${ext}`);
}

export function validatePathAgainstRoot(filePath: string): string {
  const resolved = path.resolve(filePath);
  if (resolved.includes("..")) {
    throw new Error(`Path traversal detected in: ${filePath}`);
  }
  return resolved;
}