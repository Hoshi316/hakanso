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
    style:           { type: Type.STRING },
    styleLabel:      { type: Type.STRING },
    styleEmoji:      { type: Type.STRING },
    philosophy:      { type: Type.STRING },
    tagline:         { type: Type.STRING },
    suitableFor:     { type: Type.STRING },
    tradeoff:        { type: Type.STRING },
    intensityLevel:  { type: Type.INTEGER },
    recommendedDays: { type: Type.INTEGER },
    daysComment:     { type: Type.STRING },
    goal:            { type: Type.STRING },
    summary:         { type: Type.STRING },
    steps:           { type: Type.ARRAY, items: stepSchema },
  },
  required: [
    "style", "styleLabel", "styleEmoji",
    "philosophy", "tagline", "suitableFor", "tradeoff",
    "intensityLevel", "recommendedDays", "daysComment",
    "goal", "summary", "steps",
  ],
};

export async function POST(req: Request) {
  try {
    const { goal, durationDays, message } = await req.json();

    if (!goal || !durationDays) {
      return Response.json(
        { error: "goal と durationDays は必須です" },
        { status: 400 }
      );
    }

    // ── Step1: Google検索で最新情報を収集 ──
    // structured output と Google Search は併用不可のため2段階にする
    let searchContext = "";
    try {
      const searchResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `以下の目標を達成するための、現在最も効果的・最新の学習方法、ツール、リソースをGoogle検索で調べてください。

目標: ${goal}

以下の観点で調べてください：
- 最新バージョンや最新トレンド（2024〜2025年）
- 現在最も推奨されているツールやサービス名（具体的に）
- 効率的な学習順序や方法論
- 初心者〜中級者向けの具体的なリソース名やサイト名

検索結果をもとに、重要な情報を箇条書きで300文字以内で日本語でまとめてください。`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      searchContext = searchResponse.text ?? "";
      console.log("Search context:", searchContext);
    } catch (e) {
      // 検索失敗してもプラン生成は続行
      console.warn("Search grounding skipped:", e);
    }

    // ── Step2: 検索情報を注入してJSON生成 ──
    const prompt = `
あなたは目標達成を支援するプランナーです。
以下の目標に対して、哲学が全く異なる3つのプランを作成してください。

目標: ${goal}
ユーザー希望期間(日): ${durationDays}
メッセージ: ${message ?? "なし"}

${
  searchContext
    ? `━━━━━━━━━━━━━━━━━━━━━━━━━
【Google検索で得た最新情報 - 必ずこれをステップに反映すること】
${searchContext}

重要：上記の最新情報に含まれる具体的なツール名・サービス名・学習リソース名を
各プランのステップに必ず織り込んでください。
特に Flow State プランでは具体的なツール名を2つ以上含めること。
━━━━━━━━━━━━━━━━━━━━━━━━━`
    : ""
}

━━━━━━━━━━━━━━━━━━━━━━━━━
【プラン1】style: "full_throttle"
styleLabel: "Full Throttle"
styleEmoji: "⚡"
philosophy: 速度と密度で圧倒する。今すぐ結果を出す。
tagline: 最速で、限界の向こう側へ。

期間ルール:
- ユーザー希望期間を「上限」として扱う
- 本気なら何日で達成できるかを判断して recommendedDays に設定（最短は希望の3分の1）
- ステップ数は3〜4個、1ステップの密度を高く
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
- ステップ数は5〜7個、各ステップに「なぜこれをやるか」を含める
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
- 各ステップを「1日15〜30分でできる最小単位」まで分解
- Google検索で得た具体的なツール名・アプリ名を必ず2つ以上ステップに含めること
- intensityLevel: 2
- 禁止ワード：「集中して」「まとめて」「一気に」

━━━━━━━━━━━━━━━━━━━━━━━━━
出力ルール:
- 3つのプランは明確に性格が違うこと
- recommendedDays は各プランの哲学に基づいた数値を設定すること
- daysComment は期間の根拠を1文で
- suitableFor はそのルートを選ぶべき人物像を1〜2文で
- tradeoff は「〇〇を犠牲にして、〇〇を得る」の形式で1文
- 日本語で出力
- JSONのみを出力すること
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
    return Response.json(
      { error: "プラン生成に失敗しました" },
      { status: 500 }
    );
  }
}