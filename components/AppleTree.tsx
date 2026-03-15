// components/AppleTree.tsx
"use client";
import Apple from "./Apple"; // 前回作ったリンゴパーツ

type AppleTreeProps = {
  level: number;    // 0:苗, 1:若木, 2:成木
  variety: 'sun' | 'moon' | 'midnight' | 'forest'; // リンゴの種類
  hasApple: boolean; // 実がついているかどうか
};

export default function AppleTree({ level, variety, hasApple }: AppleTreeProps) {
  return (
    <div className="relative flex flex-col items-center justify-center w-80 h-80">
      {/* 木の見た目（レベル0〜2） */}
      <div className="transition-all duration-1000 ease-out text-8xl">
        {level === 0 && "🌱"}
        {level === 1 && "🎋"}
        {level >= 2 && "🌳"} 
      </div>

      {/* リンゴの実（レベル2以上かつ実がある時だけ表示） */}
      {level >= 2 && hasApple && (
        <div className="absolute top-12 animate-bounce">
           {/* 前に作ったAppleコンポーネントを呼び出す */}
           <Apple variety={variety} size={60} />
        </div>
      )}

      {/* 地面 */}
      <div className="mt-4 w-32 h-4 bg-orange-200/50 rounded-full blur-sm"></div>
    </div>
  );
}