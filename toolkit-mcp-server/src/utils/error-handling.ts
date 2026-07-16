import type { ToolResult } from "../types.js";

export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  if (typeof error === "string") {
    return `Error: ${error}`;
  }
  return `Error: ${JSON.stringify(error)}`;
}

export function errorResult(error: unknown): ToolResult {
  const text = formatError(error);
  return {
    content: [{ type: "text", text }],
    isError: true,
  };
}

export function successResult(text: string, structuredContent?: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: "text", text }],
    structuredContent,
  };
}