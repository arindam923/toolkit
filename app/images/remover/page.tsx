"use client";

import { useState, useEffect } from "react";
import BaseTool, { ImageFile } from "../components/BaseTool";
import {
  env,
  AutoModel,
  AutoProcessor,
  RawImage,
  PreTrainedModel,
  Processor,
} from "@huggingface/transformers";

// Model configurations
const WEBGPU_MODEL_ID = "Xenova/modnet";
const FALLBACK_MODEL_ID = "briaai/RMBG-1.4";

interface ModelState {
  model: PreTrainedModel | null;
  processor: Processor | null;
  isWebGPUSupported: boolean;
  currentModelId: string;
  isIOS: boolean;
}

interface ModelInfo {
  currentModelId: string;
  isWebGPUSupported: boolean;
  isIOS: boolean;
}

// iOS detection
const isIOS = () => {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod",
  ].includes(navigator.platform) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

const state: ModelState = {
  model: null,
  processor: null,
  isWebGPUSupported: false,
  currentModelId: FALLBACK_MODEL_ID,
  isIOS: isIOS(),
};

// Initialize WebGPU with proper error handling
async function initializeWebGPU() {
  const gpu = (navigator as any).gpu;
  if (!gpu) {
    return false;
  }

  try {
    // Test if we can actually create an adapter
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      return false;
    }

    // Configure environment for WebGPU
    env.allowLocalModels = false;
    if (env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.proxy = false;
    }

    // Wait for WebAssembly initialization
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Initialize model with WebGPU
    state.model = await AutoModel.from_pretrained(WEBGPU_MODEL_ID, {
      device: "webgpu",
    });
    state.processor = await AutoProcessor.from_pretrained(WEBGPU_MODEL_ID);
    state.isWebGPUSupported = true;
    return true;
  } catch (error) {
    console.error("WebGPU initialization failed:", error);
    return false;
  }
}

// Initialize the model based on the selected model ID
export async function initializeModel(forceModelId?: string): Promise<boolean> {
  try {
    // Always use RMBG-1.4 for iOS
    if (state.isIOS) {
      console.log("iOS detected, using RMBG-1.4 model");
      env.allowLocalModels = false;
      if (env.backends?.onnx?.wasm) {
        env.backends.onnx.wasm.proxy = true;
      }

      state.model = await AutoModel.from_pretrained(FALLBACK_MODEL_ID);
      state.processor = await AutoProcessor.from_pretrained(FALLBACK_MODEL_ID);

      state.currentModelId = FALLBACK_MODEL_ID;
      return true;
    }

    // Non-iOS flow remains the same
    const selectedModelId = forceModelId || FALLBACK_MODEL_ID;

    // Try WebGPU if requested
    if (selectedModelId === WEBGPU_MODEL_ID) {
      const webGPUSuccess = await initializeWebGPU();
      if (webGPUSuccess) {
        state.currentModelId = WEBGPU_MODEL_ID;
        return true;
      }
    }

    // Use fallback model
    env.allowLocalModels = false;
    if (env.backends?.onnx?.wasm) {
      env.backends.onnx.wasm.proxy = true;
    }

    state.model = await AutoModel.from_pretrained(FALLBACK_MODEL_ID, {
      progress_callback: (progressInfo: any) => {
        console.log(`Loading model: ${Math.round(progressInfo.progress * 100)}%`);
      },
    });

    state.processor = await AutoProcessor.from_pretrained(FALLBACK_MODEL_ID, {
      revision: "main",
    });

    state.currentModelId = FALLBACK_MODEL_ID;

    if (!state.model || !state.processor) {
      throw new Error("Failed to initialize model or processor");
    }

    state.currentModelId = selectedModelId;
    return true;
  } catch (error) {
    console.error("Error initializing model:", error);
    if (forceModelId === WEBGPU_MODEL_ID) {
      console.log("Falling back to cross-browser model...");
      return initializeModel(FALLBACK_MODEL_ID);
    }
    throw new Error(error instanceof Error ? error.message : "Failed to initialize background removal model");
  }
}

// Get current model info
export function getModelInfo(): ModelInfo {
  return {
    currentModelId: state.currentModelId,
    isWebGPUSupported: Boolean((navigator as any).gpu),
    isIOS: state.isIOS,
  };
}

export async function processImage(image: File): Promise<File> {
  if (!state.model || !state.processor) {
    throw new Error("Model not initialized. Call initializeModel() first.");
  }

  const img = await RawImage.fromURL(URL.createObjectURL(image));

  try {
    // Pre-process image
    const { pixel_values } = await state.processor(img);

    // Predict alpha matte
    const { output } = await state.model({ input: pixel_values });

    // Resize mask back to original size
    const maskData = (
      await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(
        img.width,
        img.height,
      )
    ).data;

    // Create new canvas
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2d context");

    // Draw original image output to canvas
    ctx.drawImage(img.toCanvas(), 0, 0);

    // Update alpha channel
    const pixelData = ctx.getImageData(0, 0, img.width, img.height);
    for (let i = 0; i < maskData.length; ++i) {
      pixelData.data[4 * i + 3] = maskData[i];
    }
    ctx.putImageData(pixelData, 0, 0);

    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Failed to create blob")),
        "image/png",
      ),
    );

    const [fileName] = image.name.split(".");
    const processedFile = new File([blob], `${fileName}-bg-removed.png`, { type: "image/png" });
    return processedFile;
  } catch (error) {
    console.error("Error processing image:", error);
    throw new Error("Failed to process image");
  }
}

export async function processImages(images: File[]): Promise<File[]> {
  console.log("Processing images...");
  const processedFiles: File[] = [];

  for (const image of images) {
    try {
      const processedFile = await processImage(image);
      processedFiles.push(processedFile);
      console.log("Successfully processed image", image.name);
    } catch (error) {
      console.error("Error processing image", image.name, error);
    }
  }

  console.log("Processing images done");
  return processedFiles;
}

interface BackgroundRemoverSettings {
  quality: number;
  model: "briaai/RMBG-1.4" | "Xenova/modnet";
}

export default function BackgroundRemover() {
  const [settings, setSettings] = useState<BackgroundRemoverSettings>({
    quality: 90,
    model: "briaai/RMBG-1.4",
  });

  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isModelSwitching, setIsModelSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelInfo, setModelInfo] = useState<ModelInfo>(getModelInfo());

  // Initialize model on mount
  useEffect(() => {
    const loadModel = async () => {
      setIsModelLoading(true);
      setError(null);
      try {
        const initialized = await initializeModel();
        if (initialized) {
          setModelInfo(getModelInfo());
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to initialize model");
      } finally {
        setIsModelLoading(false);
      }
    };

    loadModel();
  }, []);

  // Handle model change
  const handleModelChange = async (newModel: "briaai/RMBG-1.4" | "Xenova/modnet") => {
    setIsModelSwitching(true);
    setError(null);
    try {
      const initialized = await initializeModel(newModel);
      if (initialized) {
        setSettings((prev) => ({ ...prev, model: newModel }));
        setModelInfo(getModelInfo());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to switch model");
    } finally {
      setIsModelSwitching(false);
    }
  };

  // Remove background using the AI model
  const handleRemoveBackground = async (imageFile: ImageFile): Promise<string> => {
    return new Promise((resolve, reject) => {
      processImage(imageFile.file)
        .then((processedFile) => {
          // Create object URL from processed file
          const processedUrl = URL.createObjectURL(processedFile);
          resolve(processedUrl);
        })
        .catch((err) => {
          reject(err instanceof Error ? err : new Error("Processing failed"));
        });
    });
  };

  return (
    <BaseTool
      title="BG Remover (AI)"
      description="AI-powered background removal. Remove backgrounds from images automatically with high precision using RMBG-1.4 model."
      icon="✨"
      onProcess={handleRemoveBackground}
    >
      {() => (
        <div className="space-y-4">
        {error && (
          <div className="p-4 rounded-[10px] bg-red-50 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-xs font-medium text-red-600">Error</span>
            </div>
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        <div className="p-4 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
          <div className="flex items-start gap-3">
            <div className="text-2xl">🤖</div>
            <div>
              <h3 className="text-xs font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
                AI Background Removal
              </h3>
              <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                Our AI uses the RMBG-1.4 model to analyze images and detect backgrounds with high accuracy. Works on most subjects including people, products, and objects.
              </p>
            </div>
          </div>
        </div>

        {!modelInfo.isIOS && (
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--color-text-primary)" }}
            >
              Model Selection
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleModelChange("briaai/RMBG-1.4")}
                disabled={isModelLoading || isModelSwitching}
                className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                  settings.model === "briaai/RMBG-1.4"
                    ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                    : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                }`}
              >
                RMBG-1.4 (Cross-browser)
              </button>
              {modelInfo.isWebGPUSupported && (
                <button
                  onClick={() => handleModelChange("Xenova/modnet")}
                  disabled={isModelLoading || isModelSwitching}
                  className={`px-3 py-1.5 rounded-[10px] text-xs font-medium border transition-all ${
                    settings.model === "Xenova/modnet"
                      ? "bg-[#FF5C35] text-white border-[#FF5C35]"
                      : "bg-transparent text-[var(--color-text-secondary)] border-[var(--color-border-tertiary)]"
                  }`}
                >
                  MODNet (WebGPU)
                </button>
              )}
            </div>
          </div>
        )}

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Output Quality: {settings.quality}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.quality}
            onChange={(e) => setSettings((prev) => ({ ...prev, quality: parseInt(e.target.value) }))}
            className="w-full"
            style={{
              accentColor: "#FF5C35",
            }}
          />
          <div className="flex justify-between text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
            <span>10%</span>
            <span>100%</span>
          </div>
        </div>

        <div>
          <label
            className="block text-xs font-medium mb-1.5"
            style={{ color: "var(--color-text-primary)" }}
          >
            Tips for Best Results
          </label>
          <ul className="text-xs space-y-1" style={{ color: "var(--color-text-secondary)" }}>
            <li>• Use images with a clear subject and well-defined background</li>
            <li>• Avoid complex backgrounds with similar colors to the subject</li>
            <li>• For best results, use images with good lighting</li>
            <li>• High-resolution images will produce better quality outputs</li>
          </ul>
        </div>

        <div className="p-3 rounded-[10px]" style={{ background: "var(--color-background-secondary)" }}>
          <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
            <strong>Note:</strong> First-time use may take longer as the AI model is downloaded to your browser. All processing happens locally.
          </p>
        </div>
        </div>
      )}
    </BaseTool>
  );
}