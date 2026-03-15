// components/Apple.tsx
"use client";

type AppleProps = {
  variety: 'sun' | 'moon' | 'midnight' | 'forest';
  size: number;
};

export default function Apple({ variety, size }: AppleProps) {
  // 品種ごとのデザイン設定
  const design = {
    sun: { color: "bg-red-500", shadow: "shadow-red-200", effect: "animate-pulse" },
    moon: { color: "bg-slate-300", shadow: "shadow-blue-100", effect: "" },
    midnight: { color: "bg-indigo-900", shadow: "shadow-indigo-400", effect: "brightness-110" },
    forest: { color: "bg-emerald-500", shadow: "shadow-green-200", effect: "" },
  }[variety];

  return (
    <div className="flex flex-col items-center justify-center">
      <div className={`
        rounded-full relative transition-all duration-1000 shadow-2xl
        ${design.color} ${design.shadow} ${design.effect}
      `}
      style={{ width: `${size}px`, height: `${size}px` }}>
        {/* 光沢 */}
        <div className="absolute top-1/4 left-1/4 w-1/4 h-1/4 bg-white/40 rounded-full blur-[1px]"></div>
        
        {/* 品種ごとの特別な装飾（例：midnightなら星のような点々） */}
        {variety === 'midnight' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-[10px] opacity-50">✨</span>
          </div>
        )}
      </div>
    </div>
  );
}