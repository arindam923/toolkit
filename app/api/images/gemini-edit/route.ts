import {
  type NextRequest,
  NextResponse,
} from "next/server";

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

type EditErrorResponse = {
  error: string;
  details?: string;
  status?: number;
  finishReason?: string;
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

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json<EditErrorResponse>(
        { error: "Missing GEMINI_API_KEY on server." },
        { status: 500 },
      );
    }

    const body = (await req.json()) as EditRequestBody;

    const base64Image = body.base64Image?.trim();
    const mediaType = body.mediaType?.trim() || "image/png";
    const prompt = body.prompt?.trim() || DEFAULT_PROMPT;
    const outputMimeType =
      body.outputMimeType || "image/png";

    if (!base64Image) {
      return NextResponse.json<EditErrorResponse>(
        { error: "Request must include base64Image." },
        { status: 400 },
      );
    }

    if (!prompt) {
      return NextResponse.json<EditErrorResponse>(
        {
          error: "Request must include a non-empty prompt.",
        },
        { status: 400 },
      );
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
      return NextResponse.json<EditErrorResponse>(
        {
          error: "Gemini request failed.",
          status: geminiRes.status,
          details,
        },
        { status: 502 },
      );
    }

    const data =
      (await geminiRes.json()) as GeminiGenerateResponse;

    if (data.promptFeedback?.blockReason) {
      return NextResponse.json<EditErrorResponse>(
        {
          error:
            "Request was blocked by Gemini safety filters.",
          details:
            data.promptFeedback.blockReasonMessage ||
            data.promptFeedback.blockReason,
        },
        { status: 422 },
      );
    }

    const candidate = data.candidates?.[0];
    const partsOut = candidate?.content?.parts || [];
    const imageOut = pickFirstInlineImage(partsOut);
    const textOut = pickFirstNonEmptyText(partsOut);

    if (!imageOut) {
      return NextResponse.json<EditErrorResponse>(
        {
          error: "Gemini did not return an edited image.",
          finishReason: candidate?.finishReason,
          details:
            textOut ||
            "No inline image part found in candidate output.",
        },
        { status: 502 },
      );
    }

    const response: EditSuccessResponse = {
      imageBase64: imageOut.data,
      mimeType: imageOut.mimeType,
      mediaType: imageOut.mimeType,
      text: textOut || undefined,
      model: MODEL_ID,
      latencyMs: Date.now() - startedAt,
    };

    return NextResponse.json<EditSuccessResponse>(
      response,
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json<EditErrorResponse>(
      {
        error: "Unexpected server error.",
        details:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 },
    );
  }
}
