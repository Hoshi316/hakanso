// lib/apple.ts

// 1. 12種類すべての品種（バラエティ）の型定義
export type AppleVariety = 
  | 'red' | 'pink' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'gold' // 通常品種
  | 'sakura' | 'nashi' | 'suika' | 'pin'; // 伝説品種（ビッグツリー限定）

// 2. リンゴの日本語名マスターデータ
// 貯蔵庫（Collection）などで表示する際に使用します
export const APPLE_NAMES: Record<AppleVariety, string> = {
  // 通常
  red: "サン・ルビー",
  pink: "フローラル・クォーツ",
  blue: "セレニティ・サファイア",
  green: "フォレスト・ジェイド",
  yellow: "ホープ・トパーズ",
  orange: "チアフル・アンバー",
  purple: "ミッドナイト・アメジスト",
  gold: "ゴールデン・ピピン",
  // 伝説
  sakura: "絆のサクランボ",
  nashi: "英知の梨",
  suika: "無限のスイカ",
  pin: "歓迎のパイン"
};

// 3. 品種ごとのイメージカラー（UI演出用）
export const APPLE_COLORS: Record<AppleVariety, string> = {
  red: "#ff4d4d",      // 情熱の赤
  pink: "#f691ee",     // 幸福のピンク
  blue: "#4857f7",     // 集中の青
  green: "#10b981",    // 癒やしの緑
  yellow: "#fff700",    // 希望の黄
  orange: "#ff7b00",    // 社交の橙
  purple: "#4338ca",    // 内省の紫
  gold: "#fbbf24",     // 成功の金
  sakura: "#ffb7c5",    // 絆の桜色
  nashi: "#e5c87e",     // 知恵の梨色
  suika: "#448230",     // 可能性の緑
  pin: "#ea9e58"       // 歓迎のパイン色
};

// 4. 品種ごとの説明文（タイムカプセル詳細用）
export const APPLE_DESC: Record<AppleVariety, string> = {
  red: "活力がみなぎり、情熱的に行動できた時に実る果実。",
  pink: "心が満たされ、自分や周りに優しくなれた時の記録。",
  blue: "冷静に、そして深く集中して物事に取り組めた証。",
  green: "心身を労わり、調和の取れた休息が得られた時の実り。",
  yellow: "新しいアイデアが閃き、未来に希望を感じた時の輝き。",
  orange: "誰かと繋がり、喜びを分かち合った温かな時間の結晶。",
  purple: "静かに自分と向き合い、直感に従って歩んだ軌跡。",
  gold: "困難を乗り越え、大きな一歩を刻んだ最高の達成感。",
  sakura: "仲間の応援や協力によって、一人の努力が大きな絆へと変わった証。",
  nashi: "ビッグツリーの下、静かな集中の中で深い知恵を授かった伝説の果実。",
  suika: "弾けるようなエネルギーで、無限の可能性へ飛び込んだ時の記録。",
  pin: "自分の歩みが仲間に歓迎され、広場が祝福に包まれた時に実るもてなしの果実。"
};