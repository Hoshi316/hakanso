"use client";
import Apple from "./Apple";
import { useState, useEffect } from "react";

type AppleTreeProps = {
  level: number;      // 0:苗(naegi), 1:成長(growup), 2:木(tree)
  isPlanted: boolean; // ミツバチをもらって大地(bigtree)に植わったか
  variety: 'sun' | 'moon' | 'midnight' | 'forest' | 'rare';
  hasApple: boolean;
  moodScore: number;
};

export default function AppleTree({ level, isPlanted, variety, hasApple, moodScore }: AppleTreeProps) {
  const [imgError, setImgError] = useState(false);

  // 画像パスの決定ロジック
  const getImagePath = () => {
    if (isPlanted) return "/images/bigtree.svg";
    if (level === 0) return "/images/naegi.svg";
    if (level === 1) return "/images/growup.svg";
    return "/images/tree.svg"; // level 2以上
  };

  const treeImagePath = getImagePath();

  useEffect(() => {
    setImgError(false);
  }, [level, isPlanted]);

  return (
    <div className="relative flex flex-col items-center justify-center w-80 h-80">
      
      {/* ★ 大地に植わった時のキラキラ演出（isPlantedがtrueの時のみ） */}
      {isPlanted && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 animate-pulse bg-yellow-200/10 blur-3xl rounded-full" />
          {[...Array(6)].map((_, i) => (
            <span
              key={i}
              className="absolute text-yellow-400 animate-ping opacity-60"
              style={{
                top: `${Math.random() * 80}%`,
                left: `${Math.random() * 80}%`,
                animationDuration: `${2 + i}s`,
                fontSize: `${10 + i * 2}px`
              }}
            >
              ✨
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
            }`}
            onError={() => setImgError(true)}
          />
        ) : (
          /* バックアップ（絵文字） */
          <div className="text-8xl animate-bounce">
            {isPlanted ? "🌳" : level === 0 ? "🌱" : level === 1 ? "🎋" : "🪴"}
          </div>
        )}
      </div>

      {/* リンゴの実（大地に植わった後、または鉢植えの完成後に表示） */}
      {(isPlanted || level >= 2) && hasApple && (
        <div className="absolute top-12 z-20 animate-bounce">
           <Apple variety={variety} moodScore={moodScore} />
        </div>
      )}

      {/* 地面の影（鉢植えと大地で色やサイズを少し変える） */}
      <div className={`mt-2 h-4 rounded-full blur-sm transition-all duration-1000 ${
        isPlanted ? "w-48 bg-orange-900/10" : "w-32 bg-orange-200/50"
      }`}></div>

      {/* 演出用のアニメーションCSS */}
      <style jsx>{`
        @keyframes sparkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}