import {
  type NextRequest,
  NextResponse,
} from "next/server";
import { logger } from "@/lib/logger";
import { createErrorResponse, getStatusCodeFromErrorCode } from "@/lib/api-errors";

const MODEL_ID =
  process.env.GEMINI_IMAGE_MODEL_ID ||
  "gemini-3.1-flash-image-preview";

type GeminiInlineImagePart = {
  inlineData: {
    mimeType: string;
    data: string;
  };
};

type GeminiTextPart = {
  text: string;
};

type GeminiPart = GeminiInlineImagePart | GeminiTextPart;

type GeminiCandidatePart = {
  text?: string;
  inlineData?: {
    mimeType?: string;
    data?: string;
  };
};

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: {
      parts?: GeminiCandidatePart[];
    };
    finishReason?: string;
  }>;
  promptFeedback?: {
    blockReason?: string;
    blockReasonMessage?: string;
  };
};

type EditRequestBody = {
  base64Image?: string;
  mediaType?: string;
  prompt?: string;
  outputMimeType?:
    | "image/png"
    | "image/jpeg"
    | "image/webp";
};

type EditSuccessResponse = {
  imageBase64: string;
  mimeType: string;
  mediaType?: string;
  text?: string;
  model: string;
  latencyMs?: number;
};

const DEFAULT_PROMPT =
  "Enhance this image while preserving composition and subject. Improve clarity, sharpness, and color balance naturally.";

function pickFirstNonEmptyText(
  parts: GeminiCandidatePart[] = [],
): string {
  const textPart = parts.find(
    (p) =>
      typeof p.text === "string" &&
      p.text.trim().length > 0,
  );
  return textPart?.text?.trim() || "";
}

function pickFirstInlineImage(
  parts: GeminiCandidatePart[] = [],
): {
  mimeType: string;
  data: string;
} | null {
  const imagePart = parts.find(
    (p) =>
      typeof p.inlineData?.data === "string" &&
      p.inlineData.data.length > 0 &&
      typeof p.inlineData?.mimeType === "string",
  );

  if (
    !imagePart?.inlineData?.data ||
    !imagePart.inlineData.mimeType
  ) {
    return null;
  }

  return {
    mimeType: imagePart.inlineData.mimeType,
    data: imagePart.inlineData.data,
  };
}

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const path = req.nextUrl.pathname;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const errorResponse = createErrorResponse(
        "INTERNAL_ERROR",
        "GEMINI_API_KEY is not configured on the server.",
        path,
        { setup: "Copy .env.example to .env and set GEMINI_API_KEY to enable AI image editing." }
      );
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const body = (await req.json()) as EditRequestBody;

    const base64Image = body.base64Image?.trim();
    const mediaType = body.mediaType?.trim() || "image/png";
    const prompt = body.prompt?.trim() || DEFAULT_PROMPT;
    const outputMimeType =
      body.outputMimeType || "image/png";

    if (!base64Image) {
      const errorResponse = createErrorResponse(
        "VALIDATION_ERROR",
        "Request must include base64Image.",
        path
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    if (!prompt) {
      const errorResponse = createErrorResponse(
        "VALIDATION_ERROR",
        "Request must include a non-empty prompt.",
        path
      );
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const parts: GeminiPart[] = [
      {
        text:
          "You are an expert image editor. Return the edited image only. " +
          "Keep subject identity and core composition unless prompt requests otherwise.",
      },
      {
        text: prompt,
      },
      {
        inlineData: {
          mimeType: mediaType,
          data: base64Image,
        },
      },
    ];

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            temperature: 0.2,
            responseModalities: ["TEXT", "IMAGE"],
            // Some models honor image MIME preference in this field.
            // If ignored by model, we'll still parse whatever image type is returned.
            responseMimeType: outputMimeType,
          },
        }),
      },
    );

    if (!geminiRes.ok) {
      const details = await geminiRes.text();
      logger.apiError("gemini-edit", `Gemini request failed with status ${geminiRes.status}`);
      const errorResponse = createErrorResponse(
        "SERVICE_UNAVAILABLE",
        "Gemini request failed.",
        path,
        { status: geminiRes.status, details }
      );
      return NextResponse.json(errorResponse, { status: 502 });
    }

    const data =
      (await geminiRes.json()) as GeminiGenerateResponse;

    if (data.promptFeedback?.blockReason) {
      const errorResponse = createErrorResponse(
        "VALIDATION_ERROR",
        "Request was blocked by Gemini safety filters.",
        path,
        {
          blockReason: data.promptFeedback.blockReason,
          message: data.promptFeedback.blockReasonMessage,
        }
      );
      return NextResponse.json(errorResponse, { status: 422 });
    }

    const candidate = data.candidates?.[0];
    const partsOut = candidate?.content?.parts || [];
    const imageOut = pickFirstInlineImage(partsOut);
    const textOut = pickFirstNonEmptyText(partsOut);

    if (!imageOut) {
      const errorResponse = createErrorResponse(
        "SERVICE_UNAVAILABLE",
        "Gemini did not return an edited image.",
        path,
        {
          finishReason: candidate?.finishReason,
          textResponse: textOut || "No inline image part found in candidate output.",
        }
      );
      return NextResponse.json(errorResponse, { status: 502 });
    }

    const response: EditSuccessResponse = {
      imageBase64: imageOut.data,
      mimeType: imageOut.mimeType,
      mediaType: imageOut.mimeType,
      text: textOut || undefined,
      model: MODEL_ID,
      latencyMs: Date.now() - startedAt,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    logger.apiError("gemini-edit", error);
    const errorResponse = createErrorResponse(
      "INTERNAL_ERROR",
      "Unexpected server error.",
      path,
      {
        details: error instanceof Error ? error.message : "Unknown error",
      }
    );
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
