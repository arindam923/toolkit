import { z } from "zod";
export declare const ImageCropSchema: z.ZodObject<{
    input_path: z.ZodString;
    output_path: z.ZodOptional<z.ZodString>;
    left: z.ZodOptional<z.ZodNumber>;
    top: z.ZodOptional<z.ZodNumber>;
    width: z.ZodNumber;
    height: z.ZodNumber;
    aspect_ratio: z.ZodOptional<z.ZodEnum<["free", "1:1", "4:3", "16:9", "9:16"]>>;
    quality: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    width: number;
    height: number;
    input_path: string;
    quality: number;
    output_path?: string | undefined;
    left?: number | undefined;
    top?: number | undefined;
    aspect_ratio?: "free" | "1:1" | "4:3" | "16:9" | "9:16" | undefined;
}, {
    width: number;
    height: number;
    input_path: string;
    output_path?: string | undefined;
    quality?: number | undefined;
    left?: number | undefined;
    top?: number | undefined;
    aspect_ratio?: "free" | "1:1" | "4:3" | "16:9" | "9:16" | undefined;
}>;
export type ImageCropInput = z.infer<typeof ImageCropSchema>;
export declare function imageCrop(params: ImageCropInput): Promise<{
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
//# sourceMappingURL=image-crop.d.ts.map