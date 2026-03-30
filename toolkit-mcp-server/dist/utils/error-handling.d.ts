/**
 * Format an error into an MCP tool response.
 */
export declare function toolError(message: string, details?: string): {
    content: Array<{
        type: "text";
        text: string;
    }>;
    isError: true;
};
/**
 * Format a success result into an MCP tool response.
 */
export declare function toolSuccess(textSummary: string, structuredContent?: Record<string, unknown>): {
    content: Array<{
        type: "text";
        text: string;
    }>;
    structuredContent?: Record<string, unknown>;
};
//# sourceMappingURL=error-handling.d.ts.map