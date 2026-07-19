import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export async function POST(request: NextRequest) {
  try {
    const { fabric, colour, price } = await request.json();

    if (!fabric || !colour || !price) {
      return NextResponse.json(
        { error: "fabric, colour, and price are required" },
        { status: 400 }
      );
    }

    const prompt = `Write a product caption for a saree, in this exact style and structure (this is a real example from the brand, match its tone, emoji use, and section layout):

❤️💚 Classic colours, timeless grace—crafted to make every occasion special. ❤️💚

Experience the elegance of this plain red and bottle green Cotton Saree, beautifully complemented by a lustrous zari border...

💠 Colour: Red & Bottle Green
💠 Fabric: Cotton Saree
📏 Saree Length: 6.20 meters
👗 Blouse Piece: Included
💰 Price: ₹899/-
💥 Free Shipping

🧺 Care Instructions:
- Dry clean recommended
- Do not bleach
- Dry in shade
- Iron on low to medium heat

Slight colour variations may occur due to lighting, photography, and screen resolution.

✨ Limited stock available ✨
📩 DM us to place your order

#CottonSaree #TraditionalWear #EthnicElegance #IndianWear

Now write a NEW caption for a saree with:
Fabric: ${fabric}
Colour: ${colour}
Price: ₹${price}/-

Keep the same emojis, section structure, and warm traditional tone. Vary the opening line and description naturally each time. Include relevant hashtags at the end.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Gemini API request failed" },
        { status: response.status }
      );
    }

    const caption = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!caption) {
      return NextResponse.json(
        { error: "No caption returned from Gemini" },
        { status: 500 }
      );
    }

    return NextResponse.json({ caption });
  } catch (error) {
    console.error("Gemini caption generation failed:", error);

    const message =
      error instanceof Error && error.name === "AbortError"
        ? "Request to Gemini timed out after 15 seconds"
        : "Failed to generate caption. Check your API key and quota.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}