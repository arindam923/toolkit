import { z } from "zod";
export declare const ImageConvertSchema: z.ZodObject<{
    input_path: z.ZodString;
    output_path: z.ZodOptional<z.ZodString>;
    output_format: z.ZodEnum<["jpeg", "png", "webp", "avif"]>;
    quality: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    input_path: string;
    quality: number;
    output_format: "jpeg" | "png" | "webp" | "avif";
    output_path?: string | undefined;
}, {
    input_path: string;
    output_format: "jpeg" | "png" | "webp" | "avif";
    output_path?: string | undefined;
    quality?: number | undefined;
}>;
export type ImageConvertInput = z.infer<typeof ImageConvertSchema>;
export declare function imageConvert(params: ImageConvertInput): Promise<{
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
//# sourceMappingURL=image-convert.d.ts.map