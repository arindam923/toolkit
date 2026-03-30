import sharp from "sharp";
import { z } from "zod";
import { validateInputPath, defaultOutputPath, ensureDir, fileSize, formatBytes, } from "../utils/file-io.js";
import { getImageMetadata } from "../utils/image-io.js";
import { toolError, toolSuccess } from "../utils/error-handling.js";
export const ImageCropSchema = z
    .object({
    input_path: z.string().describe("Path to input image file"),
    output_path: z
        .string()
        .optional()
        .describe("Output file path (default: input_path with '_cropped' suffix)"),
    left: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Left offset in pixels (default: centered)"),
    top: z
        .number()
        .int()
        .min(0)
        .optional()
        .describe("Top offset in pixels (default: centered)"),
    width: z
        .number()
        .int()
        .min(1)
        .max(16384)
        .describe("Crop width in pixels"),
    height: z
        .number()
        .int()
        .min(1)
        .max(16384)
        .describe("Crop height in pixels"),
    aspect_ratio: z
        .enum(["free", "1:1", "4:3", "16:9", "9:16"])
        .optional()
        .describe("Aspect ratio preset. If set, width/height define the crop area size and aspect is enforced."),
    quality: z
        .number()
        .int()
        .min(1)
        .max(100)
        .default(90)
        .describe("Output quality (1-100)"),
})
    .strict();
const ASPECT_RATIOS = {
    "1:1": 1,
    "4:3": 4 / 3,
    "16:9": 16 / 9,
    "9:16": 9 / 16,
};
export async function imageCrop(params) {
    const validation = validateInputPath(params.input_path);
    if (!validation.valid)
        return toolError(validation.error);
    const inputMeta = await getImageMetadata(params.input_path);
    const inputSize = fileSize(params.input_path);
    let cropW = params.width;
    let cropH = params.height;
    // Apply aspect ratio constraint
    if (params.aspect_ratio && params.aspect_ratio !== "free") {
        const ratio = ASPECT_RATIOS[params.aspect_ratio];
        // Use the smaller dimension and derive the other
        if (cropW / cropH > ratio) {
            cropW = Math.round(cropH * ratio);
        }
        else {
            cropH = Math.round(cropW / ratio);
        }
    }
    // Clamp to image bounds
    cropW = Math.min(cropW, inputMeta.width);
    cropH = Math.min(cropH, inputMeta.height);
    // Center if offsets not provided
    const left = params.left ?? Math.max(0, Math.round((inputMeta.width - cropW) / 2));
    const top = params.top ?? Math.max(0, Math.round((inputMeta.height - cropH) / 2));
    // Clamp offsets
    const clampedLeft = Math.min(left, inputMeta.width - cropW);
    const clampedTop = Math.min(top, inputMeta.height - cropH);
    const outputPath = params.output_path ?? defaultOutputPath(params.input_path, "cropped");
    await ensureDir(outputPath);
    const info = await sharp(params.input_path)
        .extract({
        left: clampedLeft,
        top: clampedTop,
        width: cropW,
        height: cropH,
    })
        .jpeg({ quality: params.quality })
        .toFile(outputPath);
    const outputSize = fileSize(outputPath);
    const summary = [
        `Cropped image saved to ${outputPath}`,
        `Crop region: ${clampedLeft},${clampedTop} ${cropW}×${cropH}`,
        `Original: ${inputMeta.width}×${inputMeta.height} → Cropped: ${info.width}×${info.height}`,
        `Size: ${formatBytes(inputSize)} → ${formatBytes(outputSize)}`,
    ].join("\n");
    return toolSuccess(summary, {
        success: true,
        output_path: outputPath,
        crop_region: {
            left: clampedLeft,
            top: clampedTop,
            width: info.width,
            height: info.height,
        },
        original_dimensions: { width: inputMeta.width, height: inputMeta.height },
        new_dimensions: { width: info.width, height: info.height },
        original_size_bytes: inputSize,
        new_size_bytes: outputSize,
    });
}
//# sourceMappingURL=image-crop.js.map