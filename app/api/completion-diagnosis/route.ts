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

    const prompt = `あなたは目標達成コーチです。
    ユーザーが「${goal}」を達成しました。
    以下のデータをもとに、達成診断と次回への提言を書いてください。

    【リンゴの記録（農園での気分ログ）】
      ${appleSection || "記録なし"}

    【ステップごとのフィードバック】
    ${feedbackSection || "記録なし"}

    【出力形式】
    以下の3つのセクションで書いてください：

    ■ 旅の振り返り（100文字程度）
    どんな気持ちで取り組んでいたか、山場はどこだったかを具体的に。

    ■ あなたの学習パターン
    難易度・やる気・達成感のデータから読み取れる傾向を1〜2文で。
    例：「難しいステップでもやる気が高い傾向があります」など。

    ■ 次の旅への処方箋
    このパターンを踏まえて、次のルートをどう設計すべきかを具体的に1〜2文で。
    例：「次は1ステップの量を少し減らし、週2日は余裕の日を入れると継続しやすいでしょう」など。

    最後に称号（例：「静かなる開拓者」）を一行添えてください。
    温かく、具体的に書いてください。`;

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