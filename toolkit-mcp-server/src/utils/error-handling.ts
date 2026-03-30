/**
 * Format an error into an MCP tool response.
 */
export function toolError(message: string, details?: string): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  const text = details ? `Error: ${message}\n${details}` : `Error: ${message}`;
  return {
    content: [{ type: "text" as const, text }],
    isError: true as const,
  };
}

/**
 * Format a success result into an MCP tool response.
 */
export function toolSuccess(
  textSummary: string,
  structuredContent?: Record<string, unknown>,
): {
  content: Array<{ type: "text"; text: string }>;
  structuredContent?: Record<string, unknown>;
} {
  const result: {
    content: Array<{ type: "text"; text: string }>;
    structuredContent?: Record<string, unknown>;
  } = {
    content: [{ type: "text" as const, text: textSummary }],
  };

  if (structuredContent) {
    result.structuredContent = structuredContent;
  }

  return result;
}
