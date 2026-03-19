import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT!,
  location: "us-central1",
});

export async function POST(req: Request) {
  try {
    const { routeId, goal, appleLogs, stepFeedbacks } = await req.json();

    const appleSection = appleLogs.map((l: any) =>
      `・${l.createdAt?.slice(0,10)} [${l.variety}] ${l.note || "メモなし"}`
    ).join("\n");

    const feedbackSection = stepFeedbacks.map((f: any) =>
      `・「${f.stepTitle}」 難易度:${f.difficulty}/5 達成感:${f.feeling} メモ:${f.memo || "なし"}`
    ).join("\n");

    const prompt = `あなたは目標達成コーチです。ユーザーが「${goal}」を達成しました。
データをもとに、200文字程度の達成診断を書いてください。

【リンゴの記録（気分ログ）】
${appleSection || "記録なし"}

【ステップのフィードバック】
${feedbackSection || "記録なし"}

【診断ルール】
- 取り組んでいた時の情熱や変化を振り返る
- 山場（難しかった点）を具体的に称える
- 最後に「称号（例：静かなる開拓者）」を授ける
- 次の旅への期待を込める`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const diagnosisText = response.text;

    // ★ 診断結果をこのルートに保存しておく
    const routeRef = doc(db, "routes", routeId);
    await updateDoc(routeRef, {
      finalDiagnosis: diagnosisText,
      completedAt: new Date().toISOString()
    });

    return Response.json({ diagnosis: diagnosisText });
  } catch (error) {
    console.error(error);
    return Response.json({ diagnosis: "診断に失敗しました。" }, { status: 500 });
  }
}