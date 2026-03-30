import { z } from "zod";
export declare const ImageCompressSchema: z.ZodObject<{
    input_path: z.ZodString;
    output_path: z.ZodOptional<z.ZodString>;
    quality: z.ZodDefault<z.ZodNumber>;
    max_width: z.ZodOptional<z.ZodNumber>;
    max_height: z.ZodOptional<z.ZodNumber>;
    format: z.ZodOptional<z.ZodEnum<["jpeg", "png", "webp"]>>;
    preset: z.ZodOptional<z.ZodEnum<["web_optimized", "email", "social_media", "thumbnail"]>>;
}, "strict", z.ZodTypeAny, {
    input_path: string;
    quality: number;
    format?: "jpeg" | "png" | "webp" | undefined;
    output_path?: string | undefined;
    preset?: "thumbnail" | "web_optimized" | "email" | "social_media" | undefined;
    max_width?: number | undefined;
    max_height?: number | undefined;
}, {
    input_path: string;
    format?: "jpeg" | "png" | "webp" | undefined;
    output_path?: string | undefined;
    preset?: "thumbnail" | "web_optimized" | "email" | "social_media" | undefined;
    quality?: number | undefined;
    max_width?: number | undefined;
    max_height?: number | undefined;
}>;
export type ImageCompressInput = z.infer<typeof ImageCompressSchema>;
export declare function imageCompress(params: ImageCompressInput): Promise<{
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
//# sourceMappingURL=image-compress.d.ts.map