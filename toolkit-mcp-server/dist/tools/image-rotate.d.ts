import { z } from "zod";
export declare const ImageRotateSchema: z.ZodObject<{
    input_path: z.ZodString;
    output_path: z.ZodOptional<z.ZodString>;
    degrees: z.ZodDefault<z.ZodNumber>;
    flip_horizontal: z.ZodDefault<z.ZodBoolean>;
    flip_vertical: z.ZodDefault<z.ZodBoolean>;
    quality: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    input_path: string;
    quality: number;
    degrees: number;
    flip_horizontal: boolean;
    flip_vertical: boolean;
    output_path?: string | undefined;
}, {
    input_path: string;
    output_path?: string | undefined;
    quality?: number | undefined;
    degrees?: number | undefined;
    flip_horizontal?: boolean | undefined;
    flip_vertical?: boolean | undefined;
}>;
export type ImageRotateInput = z.infer<typeof ImageRotateSchema>;
export declare function imageRotate(params: ImageRotateInput): Promise<{
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
//# sourceMappingURL=image-rotate.d.ts.map