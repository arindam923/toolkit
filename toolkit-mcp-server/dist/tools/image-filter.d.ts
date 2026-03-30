import { z } from "zod";
export declare const ImageFilterSchema: z.ZodObject<{
    input_path: z.ZodString;
    output_path: z.ZodOptional<z.ZodString>;
    brightness: z.ZodDefault<z.ZodNumber>;
    contrast: z.ZodDefault<z.ZodNumber>;
    saturation: z.ZodDefault<z.ZodNumber>;
    blur_sigma: z.ZodDefault<z.ZodNumber>;
    grayscale: z.ZodDefault<z.ZodBoolean>;
    preset: z.ZodOptional<z.ZodEnum<["vintage", "vivid", "black_and_white", "cinematic", "soft_focus"]>>;
    quality: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    input_path: string;
    quality: number;
    brightness: number;
    contrast: number;
    saturation: number;
    blur_sigma: number;
    grayscale: boolean;
    output_path?: string | undefined;
    preset?: "vintage" | "vivid" | "black_and_white" | "cinematic" | "soft_focus" | undefined;
}, {
    input_path: string;
    output_path?: string | undefined;
    preset?: "vintage" | "vivid" | "black_and_white" | "cinematic" | "soft_focus" | undefined;
    quality?: number | undefined;
    brightness?: number | undefined;
    contrast?: number | undefined;
    saturation?: number | undefined;
    blur_sigma?: number | undefined;
    grayscale?: boolean | undefined;
}>;
export type ImageFilterInput = z.infer<typeof ImageFilterSchema>;
export declare function imageFilter(params: ImageFilterInput): Promise<{
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
//# sourceMappingURL=image-filter.d.ts.map