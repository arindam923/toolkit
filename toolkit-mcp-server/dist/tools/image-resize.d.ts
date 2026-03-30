import { z } from "zod";
export declare const ImageResizeSchema: z.ZodObject<{
    input_path: z.ZodString;
    output_path: z.ZodOptional<z.ZodString>;
    width: z.ZodOptional<z.ZodNumber>;
    height: z.ZodOptional<z.ZodNumber>;
    scale_percent: z.ZodOptional<z.ZodNumber>;
    preset: z.ZodOptional<z.ZodEnum<["social", "web", "print", "thumbnail"]>>;
    maintain_aspect: z.ZodDefault<z.ZodBoolean>;
    quality: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    input_path: string;
    maintain_aspect: boolean;
    quality: number;
    width?: number | undefined;
    height?: number | undefined;
    output_path?: string | undefined;
    scale_percent?: number | undefined;
    preset?: "social" | "web" | "print" | "thumbnail" | undefined;
}, {
    input_path: string;
    width?: number | undefined;
    height?: number | undefined;
    output_path?: string | undefined;
    scale_percent?: number | undefined;
    preset?: "social" | "web" | "print" | "thumbnail" | undefined;
    maintain_aspect?: boolean | undefined;
    quality?: number | undefined;
}>;
export type ImageResizeInput = z.infer<typeof ImageResizeSchema>;
export declare function imageResize(params: ImageResizeInput): Promise<{
    content: Array<{
        type: "text";
        text: string;
    }>;
    isError: true;
} | {
    content: Array<{
        type: "text";
        text: string;
    }>;
    structuredContent?: Record<string, unknown>;
}>;
//# sourceMappingURL=image-resize.d.ts.map