import { z } from "zod";
import { loadImage, getMetadata, applyEffects, writeImage } from "../utils/image-io.js";
import { deriveOutputPath, formatBytes } from "../utils/file-io.js";
import { successResult, errorResult } from "../utils/error-handling.js";
import { EFFECTS_PRESETS, EffectsPresetSchema } from "../constants.js";
import type { EffectPreset } from "../utils/image-io.js";

export const EffectsSchema = z.object({
  input_path: z.string().describe("Path to input image file"),
  output_path: z.string().optional().describe("Path for output file. Defaults to input_path with '_effects' suffix"),
  preset: EffectsPresetSchema.describe("Named effect preset: sepia, vintage, hdr, warm, cool, sketch, emboss"),
  intensity: z.number().min(0).max(100).default(100).describe("Effect intensity percentage (0-100, default 100)"),
}).strict();

export async function imageEffects(params: z.infer<typeof EffectsSchema>) {
  try {
    const pipeline = await loadImage(params.input_path);
    const meta = await getMetadata(params.input_path);

    const preset = (EFFECTS_PRESETS as Record<string, EffectPreset>)[params.preset];
    const effectPipeline = applyEffects(pipeline, preset, params.intensity);

    const outputPath = params.output_path ?? deriveOutputPath(params.input_path, "_effects");
    const { outputSize } = await writeImage(effectPipeline, outputPath);

    return successResult(
      `Applied ${params.preset} effect (${params.intensity}% intensity) to image\nSaved to ${outputPath}\nSize: ${formatBytes(meta.size)} → ${formatBytes(outputSize)}`,
      {
        success: true,
        output_path: outputPath,
        effect: params.preset,
        intensity: params.intensity,
        original_size_bytes: meta.size,
        new_size_bytes: outputSize,
      },
    );
  } catch (error) {
    return errorResult(error);
  }
}
