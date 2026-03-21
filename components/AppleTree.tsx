"use client";
import Apple, { AppleVariety } from "./Apple"; // AppleVarietyをインポート
import { useState, useEffect } from "react";

type AppleTreeProps = {
  level: number;      // 0:苗, 1:成長, 2:木
  isPlanted: boolean; // ビッグツリー状態
  variety: AppleVariety; // ★12種類すべてを受け入れ可能に
  hasApple: boolean;
  moodScore: number;
};

export default function AppleTree({ level, isPlanted, variety, hasApple, moodScore }: AppleTreeProps) {
  const [imgError, setImgError] = useState(false);

  // 伝説の果実かどうかを判定
  const isLegendary = ['sakura', 'nashi', 'suika', 'pin'].includes(variety);

  const getImagePath = () => {
    if (isPlanted) return "/images/bigtree.svg";
    if (level === 0) return "/images/naegi.svg";
    if (level === 1) return "/images/growup.svg";
    return "/images/tree.svg";
  };

  const treeImagePath = getImagePath();

  useEffect(() => {
    setImgError(false);
  }, [level, isPlanted]);

  return (
    <div className="relative flex flex-col items-center justify-center w-80 h-80">
      
      {/* ★ 演出：大地に植わった、または伝説の果実がある時のキラキラ */}
      {(isPlanted || isLegendary) && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {/* 伝説の果実の時は少し色が豪華になる */}
          <div className={`absolute inset-0 animate-pulse blur-3xl rounded-full ${
            isLegendary ? "bg-orange-200/20" : "bg-yellow-200/10"
          }`} />
          {[...Array(isLegendary ? 10 : 6)].map((_, i) => (
            <span
              key={i}
              className={`absolute animate-ping opacity-60 ${
                isLegendary ? "text-orange-300" : "text-yellow-400"
              }`}
              style={{
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 80}%`,
                animationDuration: `${1.5 + i * 0.5}s`,
                fontSize: `${10 + i * 2}px`
              }}
            >
              {isLegendary ? "✨" : "✦"}
            </span>
          ))}
        </div>
      )}

      {/* 木の本体 */}
      <div className="z-10 flex items-center justify-center transition-all duration-1000 ease-in-out">
        {!imgError ? (
          <img 
            src={treeImagePath} 
            alt="Growth Status" 
            className={`object-contain transition-all duration-700 ${
              isPlanted ? "w-72 h-72 translate-y-2" : "w-64 h-64"
            } ${isLegendary && isPlanted ? "brightness-110 drop-shadow-[0_0_15px_rgba(255,223,0,0.3)]" : ""}`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-8xl animate-bounce">
            {isPlanted ? "🌳" : level === 0 ? "🌱" : level === 1 ? "🎋" : "🪴"}
          </div>
        )}
      </div>

      {/* リンゴの実 */}
      {(isPlanted || level >= 2) && hasApple && (
        <div className="absolute top-12 z-20 animate-bounce">
           <Apple variety={variety} moodScore={moodScore} />
        </div>
      )}

      {/* 地面の影 */}
      <div className={`mt-2 h-4 rounded-full blur-sm transition-all duration-1000 ${
        isPlanted ? "w-48 bg-orange-900/10" : "w-32 bg-orange-200/50"
      }`}></div>
    </div>
  );
}