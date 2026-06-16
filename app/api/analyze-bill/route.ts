import { NextResponse } from "next/server";
import vision from "@google-cloud/vision";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

const visionClient = new vision.ImageAnnotatorClient();

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const [result] = await visionClient.textDetection({
      image: {
        content: buffer,
      },
    });

    const extractedText = result.fullTextAnnotation?.text || "";

    const prompt = `
You are reading an electricity bill.

Extract these fields:
- monthlyKwh
- monthlyCost
- billNumber
- billingPeriod

Return JSON only in this exact format:
{
  "monthlyKwh": 0,
  "monthlyCost": 0,
  "billNumber": "",
  "billingPeriod": ""
}

If you cannot find a value, use 0 or empty string.

Bill text:
${extractedText}
`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "{}";

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      monthlyKwh: Number(parsed.monthlyKwh || 0),
      monthlyCost: Number(parsed.monthlyCost || 0),
      billNumber: parsed.billNumber || "",
      billingPeriod: parsed.billingPeriod || "",
      rawText: extractedText,
    });
  } catch (error) {
    console.error("Bill analysis error:", error);

    return NextResponse.json(
      { error: "Bill analysis failed." },
      { status: 500 }
    );
  }
}