/**
 * Hybrid Image Upscaler Service
 * Works in ANY browser with multiple fallback strategies
 *
 * Strategy order:
 * 1. Hugging Face Inference API (fast, high quality, free tier)
 * 2. UpscalerJS (client-side WebGL, unlimited free)
 * 3. Canvas Bicubic (basic, works everywhere)
 */

export interface UpscaleOptions {
  scale: 2 | 4;
  quality?: number;
  huggingFaceToken?: string;
}

export interface UpscaleResult {
  dataUrl: string;
  method: 'huggingface' | 'upscalerjs' | 'canvas';
  width: number;
  height: number;
}

// ============================================
// Strategy 1: Hugging Face Inference API
// ============================================
async function upscaleWithHuggingFace(
  imageFile: File,
  options: UpscaleOptions
): Promise<UpscaleResult | null> {
  // Accept token from options or from environment variable
  const token = options.huggingFaceToken ||
    (typeof window !== 'undefined' ?
      (window as any).NEXT_PUBLIC_HUGGINGFACE_TOKEN :
      undefined);

  if (!token) {
    console.warn('Hugging Face token not provided, skipping API upscaling');
    return null;
  }

  try {
    // Convert image to base64
    const base64 = await fileToBase64(imageFile);

    // Select model based on scale
    const modelId = options.scale === 4
      ? 'caidas/swin2SR-compressed-sr-x4-48'
      : 'caidas/swin2SR-classical-sr-x2-64';

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: base64,
          parameters: {
            'scale': options.scale,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.warn('Hugging Face API error:', error);
      return null;
    }

    const blob = await response.blob();
    const dataUrl = await blobToDataUrl(blob);

    // Get dimensions
    const dimensions = await dataUrlToDimensions(dataUrl);

    return {
      dataUrl,
      method: 'huggingface',
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error) {
    console.warn('Hugging Face upscaling failed:', error);
    return null;
  }
}

// ============================================
// Strategy 2: UpscalerJS (Client-side WebGL)
// ============================================
let upscaler2xInstance: any = null;
let upscaler4xInstance: any = null;

async function upscaleWithUpscalerJS(
  imageFile: File,
  options: UpscaleOptions
): Promise<UpscaleResult | null> {
  try {
    // Dynamic import to avoid SSR issues
    if (typeof window === 'undefined') return null;

    // Import UpscalerJS and the appropriate model
    const UpscalerJS = (await import('upscaler')).default;
    const modelModule = options.scale === 4
      ? await import('@upscalerjs/esrgan-slim/4x')
      : await import('@upscalerjs/esrgan-slim/2x');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (options.scale === 4 ? modelModule.default || modelModule : modelModule) as any;

    // Get or create cached upscaler instance for this scale
    const cacheKey = options.scale === 2 ? '2x' : '4x';
    const instance = cacheKey === '2x' ? upscaler2xInstance : upscaler4xInstance;

    if (!instance) {
      const upscaler = new UpscalerJS({
        model: model,
        // progress: (current: number, total: number) => {
        //   console.log(`UpscalerJS progress: ${Math.round((current / total) * 100)}%`);
        // },
      });
      if (cacheKey === '2x') {
        upscaler2xInstance = upscaler;
      } else {
        upscaler4xInstance = upscaler;
      }
      await upscaler.ready;
    }

    // Upscale the image
    const resultBlob = await (cacheKey === '2x' ? upscaler2xInstance : upscaler4xInstance).upscale(imageFile);

    const dataUrl = await blobToDataUrl(resultBlob);

    // Get dimensions
    const dimensions = await dataUrlToDimensions(dataUrl);

    return {
      dataUrl,
      method: 'upscalerjs',
      width: dimensions.width,
      height: dimensions.height,
    };
  } catch (error) {
    console.warn('UpscalerJS failed:', error);
    return null;
  }
}

// ============================================
// Strategy 3: Canvas Bicubic (Universal Fallback)
// ============================================
async function upscaleWithCanvas(
  imageFile: File,
  options: UpscaleOptions
): Promise<UpscaleResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas context unavailable'));
        return;
      }

      const newWidth = img.naturalWidth * options.scale;
      const newHeight = img.naturalHeight * options.scale;

      canvas.width = newWidth;
      canvas.height = newHeight;

      // High-quality bicubic-like scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const dataUrl = canvas.toDataURL('image/jpeg', (options.quality || 90) / 100);

      resolve({
        dataUrl,
        method: 'canvas',
        width: newWidth,
        height: newHeight,
      });
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    // Use object URL instead of base64 for better performance
    img.src = URL.createObjectURL(imageFile);
  });
}

// ============================================
// Helper Functions
// ============================================
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

function dataUrlToDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

// ============================================
// Main Hybrid Upscaler
// ============================================
export async function hybridUpscale(
  imageFile: File,
  options: UpscaleOptions = { scale: 2, quality: 90 }
): Promise<UpscaleResult> {
  console.log('Starting hybrid upscale with scale:', options.scale);

  // Strategy 1: Hugging Face API
  try {
    console.log('Trying Hugging Face API...');
    const hfResult = await upscaleWithHuggingFace(imageFile, options);
    if (hfResult) {
      console.log('✓ Upscaled with Hugging Face API');
      return hfResult;
    }
  } catch (error) {
    console.warn('Hugging Face failed, trying next strategy:', error);
  }

  // Strategy 2: UpscalerJS (client-side AI)
  try {
    console.log('Trying UpscalerJS (client-side AI)...');
    const upscalerResult = await upscaleWithUpscalerJS(imageFile, options);
    if (upscalerResult) {
      console.log('✓ Upscaled with UpscalerJS');
      return upscalerResult;
    }
  } catch (error) {
    console.warn('UpscalerJS failed, trying fallback:', error);
  }

  // Strategy 3: Canvas (always works)
  console.log('Using canvas fallback (bicubic upscaling)...');
  const canvasResult = await upscaleWithCanvas(imageFile, options);
  console.log('✓ Upscaled with canvas');
  return canvasResult;
}

// ============================================
// Utility: Get image dimensions from data URL
// ============================================
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}
