"use client";

// 12種類すべての品種を型定義に追加
export type AppleVariety = 
  | 'red' | 'pink' | 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'gold' // 通常
  | 'sakura' | 'nashi' | 'suika' | 'pin'; // 伝説

type Props = {
  variety: AppleVariety;
  moodScore: number; // 1〜5
};

export default function Apple({ variety, moodScore }: Props) {
  // サイズ定義（仕様通り）
  const sizeMap: Record<number, number> = {
    1: 60,
    2: 75,
    3: 90,
    4: 105,
    5: 120
  };

  // 品種名（APIの返り値）から 実際の画像ファイル名 への変換マップ
  const fileMap: Record<AppleVariety, string> = {
    // 通常品種
    red: "apple-sun",      // 赤は既存のsunを使用
    pink: "pink",          // 追加されたpink.svg
    blue: "blue",          // 追加されたblue.svg
    green: "apple-forest", // 緑は既存のforestを使用
    yellow: "yellow",      // 追加されたyellow.svg
    orange: "orange",      // 追加されたorange.svg
    purple: "apple-midnight", // 紫は既存のmidnightを使用
    gold: "apple-rare",    // ゴールドは既存のrareを使用
    
    // 伝説品種
    sakura: "sakura",
    nashi: "nashi",
    suika: "suika",
    pin: "pin"
  };

  const fileName = fileMap[variety] || "apple-forest";
  const size = sizeMap[moodScore] || 90;

  return (
    <img 
      src={`/images/${fileName}.svg`} 
      alt={variety} 
      style={{ width: `${size}px`, height: 'auto' }}
      className="drop-shadow-xl animate-bounce-slow"
    />
  );
}