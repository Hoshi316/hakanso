import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GOOGLE_CLOUD_PROJECT!,
  location: "us-central1",
});

const stepSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    scheduledDay: { type: Type.INTEGER },
  },
  required: ["title", "description", "scheduledDay"],
};

const planSchema = {
  type: Type.OBJECT,
  properties: {
    style: { type: Type.STRING },
    styleLabel: { type: Type.STRING },
    styleEmoji: { type: Type.STRING },
    philosophy: { type: Type.STRING },
    tagline: { type: Type.STRING },
    suitableFor: { type: Type.STRING },
    tradeoff: { type: Type.STRING },
    intensityLevel: { type: Type.INTEGER },
    recommendedDays: { type: Type.INTEGER },
    daysComment: { type: Type.STRING },
    goal: { type: Type.STRING },
    summary: { type: Type.STRING },
    steps: { type: Type.ARRAY, items: stepSchema },
  },
  required: ["style", "styleLabel", "styleEmoji", "philosophy", "tagline", "suitableFor", "tradeoff", "intensityLevel", "recommendedDays", "daysComment", "goal", "summary", "steps"],
};

export async function POST(req: Request) {
  try {
    const { goal, durationDays, message, userId } = await req.json();

    if (!goal || !durationDays) {
      return Response.json({ error: "goal と durationDays は必須です" }, { status: 400 });
    }

    // ── 過去の全フィードバックを分析 ──
    let feedbackContext = "";
    if (userId) {
      try {
        const { db } = await import("@/lib/firebase");
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const snap = await getDocs(query(collection(db, "routes"), where("userId", "==", userId)));
        const allFeedbacks = snap.docs.flatMap(d => d.data().stepFeedbacks || []);

        if (allFeedbacks.length > 0) {
          const avgDiff = (allFeedbacks.reduce((s: number, f: any) => s + f.difficulty, 0) / allFeedbacks.length).toFixed(1);

          const feelings = allFeedbacks.map((f: any) => f.feeling).filter(Boolean);
          const batchiCount = feelings.filter((f: string) => f === "バッチリ").length;
          const muzuiCount = feelings.filter((f: string) => f === "微妙").length;
          const maaCount = feelings.filter((f: string) => f === "まあまあ").length;
          const totalFeelings = feelings.length;

          const avgEnergy = allFeedbacks.filter((f: any) => f.energy).length > 0
            ? (allFeedbacks.reduce((s: number, f: any) => s + (f.energy || 3), 0) / allFeedbacks.length).toFixed(1)
            : null;

          const hardMemos = allFeedbacks
            .filter((f: any) => f.difficulty >= 4 && f.memo)
            .map((f: any) => `"${f.memo}"`)
            .slice(0, 5)
            .join(", ");

          const easyMemos = allFeedbacks
            .filter((f: any) => f.difficulty <= 2 && f.memo)
            .map((f: any) => `"${f.memo}"`)
            .slice(0, 3)
            .join(", ");

          const totalRoutes = snap.docs.length;
          const completedRoutes = snap.docs.filter(d => d.data().progress === 100).length;

          const feelingTrend = totalFeelings > 0
            ? (batchiCount >= maaCount && batchiCount >= muzuiCount
                ? "バッチリ（余裕があるかも）"
                : muzuiCount >= batchiCount && muzuiCount >= maaCount
                ? "微妙（少し詰め込みすぎかも）"
                : "まあまあ（バランスが良い）")
            : "データなし";

          feedbackContext = `
【このユーザーの過去の学習パターン（${totalRoutes}件のルート・${allFeedbacks.length}件のフィードバックから分析）】

■ 達成状況
- 過去のルート完了率: ${completedRoutes}/${totalRoutes}件完了

■ 難易度の傾向
- ステップの平均難易度: ${avgDiff}/5
- 難しいと感じた時のメモ: ${hardMemos || "なし"}
- 簡単すぎた時のメモ: ${easyMemos || "なし"}

■ やる気・達成感の傾向
${avgEnergy ? `- 平均やる気スコア: ${avgEnergy}/5` : ""}
- 達成感の内訳: バッチリ ${batchiCount}回 / まあまあ ${maaCount}回 / 微妙 ${muzuiCount}回
- 最も多い達成感: ${feelingTrend}

■ このデータを踏まえたプラン調整指示（必ず反映すること）
${Number(avgDiff) >= 4 ? "- 難易度が高め → 1ステップの量を減らし、より細かく分割すること" : ""}
${Number(avgDiff) <= 2 ? "- 難易度が低め → もう少し密度を上げてチャレンジングにしてOK" : ""}
${muzuiCount > batchiCount ? "- 達成感「微妙」が多い → 序盤に簡単なステップを多めに配置し、小さな成功体験を積ませること" : ""}
${batchiCount > muzuiCount + maaCount ? "- 達成感「バッチリ」が多い → ステップ数を増やすか、1ステップの内容を充実させてOK" : ""}
${completedRoutes === 0 ? "- まだ完了ルートがない → 短期間で達成感を得やすいプランを優先すること" : ""}
`;
        }
      } catch (e) {
        console.warn("フィードバック取得失敗:", e);
      }
    }

    // ── Google検索で最新情報を収集 ──
    let searchContext = "";
    try {
      const searchResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `以下の目標を達成するための、現在（2025年）最も効果的・最新の学習方法、ツール、リソースをGoogle検索で調べてください。
        
目標: ${goal}

以下の観点で調べてください：
- 最新バージョンや最新トレンド
- 現在最も推奨されているツールやサービス
- 効率的な学習順序や方法論
- 初心者〜中級者向けの具体的なリソース

検索結果をもとに、重要な情報を200文字以内で日本語でまとめてください。`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      searchContext = searchResponse.text ?? "";
    } catch (e) {
      console.warn("Search grounding failed, continuing without it:", e);
    }

    // ── プラン生成 ──
    const prompt = `
あなたは目標達成を支援するプランナーです。
以下の目標に対して、哲学が全く異なる3つのプランを作成してください。

目標: ${goal}
ユーザー希望期間(日): ${durationDays}
メッセージ: ${message ?? "なし"}

${feedbackContext}

${searchContext ? `【Google検索で得た最新情報】
${searchContext}
上記の最新情報を必ずプランのステップに反映させてください。特にFlow Stateプランでは具体的なツール名を含めること。
` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━
【プラン1】style: "full_throttle"
styleLabel: "Full Throttle"
styleEmoji: "⚡"
philosophy: 速度と密度で圧倒する。今すぐ結果を出す。
tagline: 最速で、限界の向こう側へ。

期間ルール:
- ユーザー希望期間を「上限」として扱う
- 最短は希望期間の3分の1まで許容
- intensityLevel: 5
- 禁止ワード：「無理せず」「少しずつ」「ゆっくり」

━━━━━━━━━━━━━━━━━━━━━━━━━
【プラン2】style: "wayfinder"
styleLabel: "Wayfinder"
styleEmoji: "🧭"
philosophy: 納得と理解を積み重ねる。自分の地図を自分で描く。
tagline: 正解より納得を。本物の力をつける旅。

期間ルール:
- ユーザー希望期間（${durationDays}日）をそのまま recommendedDays に設定
- intensityLevel: 3
- 禁止ワード：「効率」「最短」「ショートカット」

━━━━━━━━━━━━━━━━━━━━━━━━━
【プラン3】style: "flow_state"
styleLabel: "Flow State"
styleEmoji: "🌊"
philosophy: 毎日15分でも続く習慣に変換する。AIと道具を賢く使い、消耗しない。
tagline: 頑張らずに、仕組みで進む。

期間ルール:
- ユーザー希望期間より長くして良い（最大1.5倍まで）
- 必ず具体的なツール・アプリ名を1ステップ以上に含めること
- intensityLevel: 2
- 禁止ワード：「集中して」「まとめて」「一気に」

━━━━━━━━━━━━━━━━━━━━━━━━━
出力ルール:
- 3つのプランは明確に性格が違うこと
- 日本語で出力
- JSONのみを出力し、解説などは含めないこと
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plans: { type: Type.ARRAY, items: planSchema },
          },
          required: ["plans"],
        },
      },
    });

    const text = response.text;
    const data = JSON.parse(text);
    return Response.json(data);

  } catch (error) {
    console.error(error);
    return Response.json({ error: "プラン生成に失敗しました" }, { status: 500 });
  }
}