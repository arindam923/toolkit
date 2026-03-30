import {
  type NextRequest,
  NextResponse,
} from "next/server";

type PaletteItem = {
  hex: string;
  role: string;
};

type TypographyItem = {
  name: string;
  role: string;
  weight: string;
  preview: string;
  notes: string;
};

type DesignSystemResult = {
  palette: PaletteItem[];
  typography: TypographyItem[];
  designNotes: string;
};

const MODEL_ID = "gemini-3-flash-preview";

function normalizeHex(value: string): string {
  const v = value.trim();
  if (!v.startsWith("#")) return v;
  if (v.length === 4) {
    const r = v[1];
    const g = v[2];
    const b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return v.toUpperCase();
}

function isHex(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(
    value.trim(),
  );
}

function extractFirstJsonObject(raw: string): string {
  const cleaned = raw.replace(/```json|```/gi, "").trim();

  const firstBrace = cleaned.indexOf("{");
  if (firstBrace === -1) return cleaned;

  let depth = 0;
  let inString = false;
  let escaping = false;

  for (let i = firstBrace; i < cleaned.length; i++) {
    const ch = cleaned[i];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (ch === "\\") {
        escaping = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return cleaned.slice(firstBrace, i + 1);
      }
    }
  }

  // If object appears truncated, return from first brace onward so caller can decide retry.
  return cleaned.slice(firstBrace);
}

function isLikelyTruncatedJson(text: string): boolean {
  const candidate = extractFirstJsonObject(text).trim();
  if (!candidate) return true;

  // Quick structural signal: open braces exceed close braces.
  const openBraces = (candidate.match(/{/g) || []).length;
  const closeBraces = (candidate.match(/}/g) || []).length;
  if (openBraces > closeBraces) return true;

  // Often-truncated payloads end inside strings/objects without a proper terminator.
  return !candidate.endsWith("}");
}

function parseGeminiTextToDesignSystem(
  raw: string,
): DesignSystemResult {
  const jsonText = extractFirstJsonObject(raw);
  const parsed = JSON.parse(
    jsonText,
  ) as Partial<DesignSystemResult>;

  const palette: PaletteItem[] = Array.isArray(
    parsed.palette,
  )
    ? parsed.palette
        .filter(
          (c): c is PaletteItem =>
            !!c &&
            typeof c.hex === "string" &&
            typeof c.role === "string",
        )
        .map((c) => ({
          hex: normalizeHex(c.hex),
          role: c.role.trim(),
        }))
        .filter((c) => isHex(c.hex))
        .slice(0, 8)
    : [];

  const typography: TypographyItem[] = Array.isArray(
    parsed.typography,
  )
    ? parsed.typography
        .filter(
          (t): t is TypographyItem =>
            !!t &&
            typeof t.name === "string" &&
            typeof t.role === "string" &&
            typeof t.weight === "string" &&
            typeof t.preview === "string" &&
            typeof t.notes === "string",
        )
        .map((t) => ({
          name: t.name.trim(),
          role: t.role.trim(),
          weight: t.weight.trim(),
          preview: t.preview.trim(),
          notes: t.notes.trim(),
        }))
        .slice(0, 4)
    : [];

  return {
    palette,
    typography,
    designNotes:
      typeof parsed.designNotes === "string"
        ? parsed.designNotes.trim()
        : "",
  };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY on server." },
        { status: 500 },
      );
    }

    const body = (await req.json()) as {
      base64Image?: string;
      mediaType?: string;
    };

    const base64Image = body?.base64Image?.trim();
    const mediaType =
      body?.mediaType?.trim() || "image/png";

    if (!base64Image) {
      return NextResponse.json(
        { error: "Request must include base64Image." },
        { status: 400 },
      );
    }

    const prompt = `Analyze this UI screenshot and extract its design system. Respond ONLY with a valid JSON object — no markdown, no backticks, no explanation before or after.

The JSON must follow this exact structure:
{
  "palette": [
    { "hex": "#XXXXXX", "role": "short role like Primary Background, Accent, etc." }
  ],
  "typography": [
    {
      "name": "Font name or best guess",
      "role": "Heading / Body / Mono / UI Label / etc.",
      "weight": "e.g. 700 Bold",
      "preview": "Short sample sentence",
      "notes": "One sentence about its character and use"
    }
  ],
  "designNotes": "2–4 sentences of design system observations: mood, contrast strategy, spacing, and any interesting design choices."
}

Extract 5–8 colors that truly represent the palette. Extract 2–4 typography styles. Be specific and perceptive.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1000,
            responseMimeType: "application/json",
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: mediaType,
                    data: base64Image,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!geminiRes.ok) {
      const details = await geminiRes.text();
      return NextResponse.json(
        {
          error: "Gemini request failed.",
          status: geminiRes.status,
          details,
        },
        { status: 502 },
      );
    }

    const data = await geminiRes.json();
    const rawText =
      data?.candidates?.[0]?.content?.parts?.find(
        (part: { text?: string }) =>
          typeof part?.text === "string" &&
          part.text.trim().length > 0,
      )?.text || "";

    if (!rawText) {
      return NextResponse.json(
        {
          error:
            "Model response did not include text output.",
        },
        { status: 502 },
      );
    }

    let result: DesignSystemResult | null = null;
    let parseError: unknown = null;

    try {
      result = parseGeminiTextToDesignSystem(rawText);
    } catch (err) {
      parseError = err;
    }

    if (!result) {
      // One retry with stronger constraints when the first response is truncated or malformed.
      const retryPrompt =
        `${prompt}\n\n` +
        "IMPORTANT: Return ONLY a complete, valid JSON object. " +
        "Do not truncate. Ensure all strings and braces are properly closed.";

      const retryRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1400,
              responseMimeType: "application/json",
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    inlineData: {
                      mimeType: mediaType,
                      data: base64Image,
                    },
                  },
                  {
                    text: retryPrompt,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (retryRes.ok) {
        const retryData = await retryRes.json();
        const retryRawText =
          retryData?.candidates?.[0]?.content?.parts?.find(
            (part: { text?: string }) =>
              typeof part?.text === "string" &&
              part.text.trim().length > 0,
          )?.text || "";

        if (retryRawText) {
          try {
            result =
              parseGeminiTextToDesignSystem(retryRawText);
          } catch (err) {
            parseError = err;
          }
        }
      }
    }

    if (!result) {
      const truncated = isLikelyTruncatedJson(rawText);
      return NextResponse.json(
        {
          error: "Failed to parse model output as JSON.",
          reason: truncated
            ? "Likely truncated response from model."
            : "Malformed JSON response.",
          raw: rawText,
          details:
            parseError instanceof Error
              ? parseError.message
              : "Unknown parse error",
        },
        { status: 502 },
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
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
