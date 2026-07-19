import { NextRequest, NextResponse } from "next/server";

const GEMINI_IMAGE_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent";

const STYLE_PROMPT = `Take this folded saree product photo and place it into an elegant, warm, professional product-photography scene in this exact style: a soft cream/ivory silk fabric drape flowing in the background, scattered fresh white jasmine flowers and small green buds nearby, an antique brass plate or brass diya lamp placed beside the saree, warm soft natural studio lighting with gentle shadows, a warm neutral cream/beige backdrop. Leave clear empty space in the top-right corner of the image for a logo to be added later. Do not change the saree itself — keep its exact colors, folds, border pattern, and texture unchanged. Only replace and restyle the background and surrounding props.`;

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl } = await request.json();

    console.log("Received imageDataUrl type:", typeof imageDataUrl);
    console.log("Received imageDataUrl preview:", imageDataUrl?.slice(0, 60));

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: "imageDataUrl is required" },
        { status: 400 }
      );
    }

    const match = imageDataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { error: "Invalid image data URL" },
        { status: 400 }
      );
    }

    const mimeType = match[1];
    const base64Data = match[2];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);

    const response = await fetch(
      `${GEMINI_IMAGE_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: STYLE_PROMPT },
                { inlineData: { mimeType, data: base64Data } },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini image API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Gemini image request failed" },
        { status: response.status }
      );
    }

    const parts = data.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: { inlineData?: unknown }) => p.inlineData);

    if (!imagePart) {
      console.error("No image part in response:", JSON.stringify(data));
      return NextResponse.json(
        { error: "No image returned from Gemini" },
        { status: 500 }
      );
    }

    const outputMime = imagePart.inlineData.mimeType || "image/png";
    const outputData = imagePart.inlineData.data;

    return NextResponse.json({
      imageDataUrl: `data:${outputMime};base64,${outputData}`,
    });
  } catch (error) {
    console.error("Gemini background generation failed:", error);

    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Request to Gemini timed out"
        : "Failed to generate styled background. Check your API key and quota.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}