"use client";
import { useState, use } from "react"; 
import AppleTree from "@/components/AppleTree";
import Link from "next/link";

export default function GardenPage({ params }: { params: Promise<{ routeId: string }> }) {
  // 1. Next.js 15のルール：Promiseを展開してIDを取り出す
  const resolvedParams = use(params);
  const routeId = resolvedParams.routeId;

  // 状態管理
  const [nutrition, setNutrition] = useState(0);
  const [isAdult, setIsAdult] = useState(false); 
  const [mood, setMood] = useState(3);
  const [memo, setMemo] = useState("");
  const [variety, setVariety] = useState<'sun' | 'moon' | 'midnight' | 'forest'>('forest');
  const [isWatering, setIsWatering] = useState(false);

  const isFull = nutrition >= 100;

  // 木のレベル計算
  let treeLevel = 0;
  if (isAdult) {
    treeLevel = 2; // 大人ならずっと 🌳
  } else {
    treeLevel = nutrition < 30 ? 0 : nutrition < 60 ? 1 : 2;
  }

  const handleGiveNutrition = () => {
    setIsWatering(true);
    setTimeout(() => {
      const boost = mood * 5 + (memo.length > 0 ? 10 : 0);
      const newNutrition = Math.min(nutrition + boost, 100);
      setNutrition(newNutrition);

      if (newNutrition >= 60) setIsAdult(true);

      if (mood >= 4) setVariety('sun');
      else if (mood <= 2) setVariety('midnight');
      else setVariety('forest');

      setIsWatering(false);
    }, 1000);
  };

  const handleHarvest = () => {
    const newApple = { id: Date.now(), variety, memo, date: new Date().toLocaleDateString() };
    const savedApples = JSON.parse(localStorage.getItem("apple-collection") || "[]");
    localStorage.setItem("apple-collection", JSON.stringify([...savedApples, newApple]));

    alert("リンゴを収穫しました！🍎");
    setNutrition(0); 
    setMemo("");
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6 pb-24 flex flex-col items-center">
      {/* ヘッダー */}
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-black text-orange-900">🍎 Route & Root 農園</h1>
        <p className="text-orange-600/80">ROUTE ID: {routeId}</p>
      </header>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* 左側：入力エリア */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-orange-100">
          <h2 className="text-xl font-bold text-gray-700 mb-6">📝 今日の養分</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">やる気レベル：{mood}</label>
              <input 
                type="range" min="1" max="5" value={mood} 
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full accent-orange-500"
              />
            </div>
            <textarea 
              className="w-full p-4 bg-orange-50/50 border border-orange-100 rounded-xl h-32 outline-none"
              placeholder="今の気持ちをメモして養分にしよう..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
            {isFull ? (
              <button onClick={handleHarvest} className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black rounded-2xl shadow-lg animate-bounce">
                🍎 リンゴを収穫する！
              </button>
            ) : (
              <button onClick={handleGiveNutrition} disabled={isWatering} className="w-full py-4 bg-orange-500 text-white font-bold rounded-2xl shadow-lg">
                {isWatering ? "養分吸収中..." : "養分を注ぐ 💧"}
              </button>
            )}
          </div>
        </div>

        {/* 右側：表示エリア */}
        <div className="flex flex-col items-center justify-center bg-white p-8 rounded-3xl shadow-xl border-2 border-emerald-100 min-h-[450px]">
          <AppleTree level={treeLevel} variety={variety} hasApple={isFull} />
          <div className="mt-8 w-full max-w-xs">
            <div className="flex justify-between text-xs font-bold text-emerald-700 mb-1">
              <span>成長ゲージ</span>
              <span>{nutrition}%</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${nutrition}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* フッターナビゲーション */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/80 backdrop-blur-md p-4 rounded-full shadow-2xl border border-white/50 flex justify-around items-center">
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
          <span className="text-2xl text-white">🍎</span>
        </div>
        <Link href={`/map/${routeId}`} className="flex flex-col items-center gap-1">
          <span className="text-2xl">🗺️</span>
          <span className="text-[10px] font-bold text-slate-500">マップ</span>
        </Link>
        <Link href="/collection/user-1" className="flex flex-col items-center gap-1">
          <span className="text-2xl">📦</span>
          <span className="text-[10px] font-bold text-slate-500">貯蔵庫</span>
        </Link>
      </footer>
    </div>
  );
}