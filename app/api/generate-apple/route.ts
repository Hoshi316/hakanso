import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT!,
  location: "us-central1",
});

export async function POST(req: Request) {
  try {
    const { moodScore, note, image, isPlanted, seeds } = await req.json();

    const prompt = `あなたは不思議な農園の園主です。
ユーザーが「今日頑張ったこと」「感じたこと」を報告しに来ました。
入力された情報（数値、メモ、画像）を総合的に分析し、今のユーザーの心に最も寄り添う【リンゴの品種】を1つ選び、15文字以内の【メッセージ】を返してください。

【入力情報】
- やる気レベル: ${moodScore || 3}/5
- ユーザーのメモ: ${note || "（入力なし）"}
- ビッグツリー状態: ${isPlanted ? "大地に根を張っている" : "まだ鉢植え"}
- 所持している情熱の種: ${seeds || 0}粒

【分析のガイドライン】
1. メモがない場合: 
   送られてきた「画像」の内容から、何が行われたか（勉強、仕事、リラックス、運動など）を読み取ってください。画像もない場合は「やる気レベル」からユーザーの今の波を推測してください。
2. 画像がある場合:
   画像に写っているもの（ノートの書き込み、PC画面のコード、使い込まれた靴など）を具体的に褒めてください。

【1. 品種の決定ルール】
以下の色彩心理学に基づき、SVGファイル名（品種）を決定してください。

＜通常品種（いつでも実る）＞
- red: 活力がみなぎっている、または気合を入れたい時（やる気4-5）
- pink: 幸せを感じている、自分を労わっている時（癒やし・幸福）
- blue: 黙々と集中している、冷静に作業した時（集中・知的）
- green: 疲れを癒やしたい、リフレッシュした時（健康・調和）
- yellow: アイデアが湧いた、新しい発見があった時（希望・好奇心）
- orange: 誰かと協力した、前向きに楽しんだ時（温かさ・社交）
- purple: 深く考え込んだ、自分と向き合った時（直感・内省）
- gold: 大きな一歩を踏み出した、非常に高い達成感（成功）

＜伝説の品種（★ビッグツリー状態の時のみ選出可能）＞
- sakura: 絆。仲間の種(seeds)が多い時、または誰かへの感謝がある時。
- nashi: 英知。静かな環境で、深い学びや知恵を得た時。
- suika: 無限の可能性。やる気MAX(Lv.5)で、新しい挑戦に飛び込んだ時。
- pin: 歓迎。自分の成果を誰かに見せたい、広場に繋がっている時。

※ まだ鉢植えの場合は、必ず＜通常品種＞から選んでください。

【2. メッセージの作成ルール】
- 15文字以内。
- メモがない場合は、画像から読み取った「努力の跡」に触れる（例：「その計算の跡、輝いてるよ」）。
- 画像もメモもない場合は、やる気レベルに応じた励ましを（例：「静かな歩みも、立派な養分だよ」）。

【出力形式】
JSON形式のみ。
{
  "variety": "品種名",
  "message": "温かいメッセージ"
}`;

    const contentParts: any[] = [{ text: prompt }];

    // 画像（Base64）がある場合、Geminiに渡す
    if (image && image.includes(",")) {
      const base64Data = image.split(",")[1];
      const mimeType = image.split(";")[0].split(":")[1];

      contentParts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType || "image/jpeg",
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: contentParts }],
      config: { responseMimeType: "application/json" }
    });

    const resText = response.text || "{}";
    const result = JSON.parse(resText);

    return Response.json({
      variety: result.variety || "green",
      message: result.message || "木があなたの成長を見ています。"
    });

  } catch (error) {
    console.error("Generate Apple Error:", error);
    return Response.json({ variety: "green", message: "木が静かに見守っています。" });
  }
}