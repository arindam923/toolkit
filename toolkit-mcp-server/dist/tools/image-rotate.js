import sharp from "sharp";
import { z } from "zod";
import { validateInputPath, defaultOutputPath, ensureDir, fileSize, formatBytes, } from "../utils/file-io.js";
import { getImageMetadata } from "../utils/image-io.js";
import { toolError, toolSuccess } from "../utils/error-handling.js";
export const ImageRotateSchema = z
    .object({
    input_path: z.string().describe("Path to input image file"),
    output_path: z
        .string()
        .optional()
        .describe("Output file path (default: input_path with '_rotated' suffix)"),
    degrees: z
        .number()
        .int()
        .min(-360)
        .max(360)
        .default(0)
        .describe("Rotation angle in degrees (positive = clockwise)"),
    flip_horizontal: z
        .boolean()
        .default(false)
        .describe("Mirror the image horizontally (flip left-right)"),
    flip_vertical: z
        .boolean()
        .default(false)
        .describe("Mirror the image vertically (flip top-bottom)"),
    quality: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(90)
        .describe("Output quality (1-100)"),
})
    .strict();
export async function imageRotate(params) {
    const validation = validateInputPath(params.input_path);
    if (!validation.valid)
        return toolError(validation.error);
    const inputMeta = await getImageMetadata(params.input_path);
    const inputSize = fileSize(params.input_path);
    if (params.degrees === 0 &&
        !params.flip_horizontal &&
        !params.flip_vertical) {
        return toolError("No transformation specified", "Provide degrees, flip_horizontal, or flip_vertical.");
    }
    const outputPath = params.output_path ?? defaultOutputPath(params.input_path, "rotated");
    await ensureDir(outputPath);
    let pipeline = sharp(params.input_path);
    if (params.degrees !== 0) {
        pipeline = pipeline.rotate(params.degrees, {
            background: { r: 255, g: 255, b: 255, alpha: 1 },
        });
    }
    if (params.flip_horizontal || params.flip_vertical) {
        // sharp uses flip (vertical) and flop (horizontal)
        if (params.flip_vertical)
            pipeline = pipeline.flip();
        if (params.flip_horizontal)
            pipeline = pipeline.flop();
    }
    const info = await pipeline.jpeg({ quality: params.quality }).toFile(outputPath);
    const outputSize = fileSize(outputPath);
    const ops = [];
    if (params.degrees !== 0)
        ops.push(`rotate ${params.degrees}°`);
    if (params.flip_horizontal)
        ops.push("flip horizontal");
    if (params.flip_vertical)
        ops.push("flip vertical");
    const summary = [
        `Transformed image saved to ${outputPath}`,
        `Operations: ${ops.join(", ")}`,
        `Dimensions: ${inputMeta.width}×${inputMeta.height} → ${info.width}×${info.height}`,
        `Size: ${formatBytes(inputSize)} → ${formatBytes(outputSize)}`,
    ].join("\n");
    return toolSuccess(summary, {
        success: true,
        output_path: outputPath,
        operations: ops,
        original_dimensions: { width: inputMeta.width, height: inputMeta.height },
        new_dimensions: { width: info.width, height: info.height },
        original_size_bytes: inputSize,
        new_size_bytes: outputSize,
    });
}
//# sourceMappingURL=image-rotate.js.map