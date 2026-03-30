/**
 * Format an error into an MCP tool response.
 */
export function toolError(message, details) {
    const text = details ? `Error: ${message}\n${details}` : `Error: ${message}`;
    return {
        content: [{ type: "text", text }],
        isError: true,
    };
}
/**
 * Format a success result into an MCP tool response.
 */
export function toolSuccess(textSummary, structuredContent) {
    const result = {
        content: [{ type: "text", text: textSummary }],
    };
    if (structuredContent) {
        result.structuredContent = structuredContent;
    }
    return result;
}
//# sourceMappingURL=error-handling.js.map