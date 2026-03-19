import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT!,
  location: "us-central1",
});

export async function POST(req: Request) {
  try {
    const { audio, mimeType } = await req.json();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [
          {
            inlineData: {
              data: audio,
              mimeType: mimeType || "audio/webm",
            }
          },
          {
            text: "この音声を日本語でそのまま文字起こしてください。余計な説明は不要です。話された内容だけを返してください。"
          }
        ]
      }]
    });

    const text = response.text?.trim() || "";
    return Response.json({ text });

  } catch (error) {
    console.error("文字起こしエラー:", error);
    return Response.json({ text: "" }, { status: 500 });
  }
}