"use client"; // 必ず1行目に書く

import { useState, use, useEffect } from "react"; 
import { auth } from "@/lib/firebase"; // Firebase設定
import { onAuthStateChanged, User } from "firebase/auth";
import AppleTree from "@/components/AppleTree";
import HarvestModal from "@/components/HarvestModal";
import Link from "next/link";

export default function GardenPage({ params }: { params: Promise<{ routeId: string }> }) {
  // paramsの展開
  const { routeId } = use(params);

  // 1. ユーザー状態の管理
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. 農園の状態管理
  const [nutrition, setNutrition] = useState(0);
  const [isAdult, setIsAdult] = useState(false); 
  const [mood, setMood] = useState(3);
  const [memo, setMemo] = useState("");
  const [variety, setVariety] = useState<'sun' | 'moon' | 'midnight' | 'forest' | 'rare'>('forest');
  const [isWatering, setIsWatering] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ログイン状態を監視して、Googleアカウントの情報を取得する
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isFull = nutrition >= 100;
  let treeLevel = isAdult ? 2 : (nutrition < 30 ? 0 : nutrition < 60 ? 1 : 2);

  // 養分を与える
  const handleGiveNutrition = () => {
    setIsWatering(true);
    setTimeout(() => {
      const boost = mood * 5 + (memo.length > 0 ? 10 : 0);
      const newNutrition = Math.min(nutrition + boost, 100);
      setNutrition(newNutrition);

      if (newNutrition >= 60) setIsAdult(true);

      // 品種判定
      if (Math.random() < 0.1) {
        setVariety('rare');
      } else {
        if (mood >= 4) setVariety('sun');
        else if (mood <= 2) setVariety('midnight');
        else setVariety('forest');
      }
      setIsWatering(false);
    }, 1000);
  };

  // 収穫（Firestoreに本物のユーザーIDで保存）
  const handleHarvest = async () => {
    if (!user) {
      alert("ログインしていないため保存できません");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch("/api/save-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid, // GoogleアカウントのUIDを使用
          routeId: routeId,
          moodScore: mood,
          note: memo,
          variety: variety 
        }),
      });

      if (!response.ok) throw new Error("保存失敗");
      setShowModal(true);
    } catch (error) {
      console.error(error);
      alert("保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNutrition(0); 
    setMemo("");
  };

  if (loading) return <div className="p-10 text-center font-bold">農園を準備中...</div>;

  return (
    <div className="min-h-screen bg-orange-50 p-6 pb-32 flex flex-col items-center">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-black text-orange-900">🍎 Route & Root 農園</h1>
        <p className="text-orange-600/80 font-bold">
          {user ? `${user.displayName} さんの農園` : "ゲストの農園"}
        </p>
        <p className="text-xs text-orange-400 mt-1 uppercase tracking-widest">Route: {routeId}</p>
      </header>

      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start mb-10">
        <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-orange-100">
          <h2 className="text-xl font-black text-slate-700 mb-6">📝 今日の養分</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2">気分：{mood}</label>
              <input type="range" min="1" max="5" value={mood} onChange={(e) => setMood(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
            <textarea 
              className="w-full p-4 bg-orange-50/50 border-2 border-orange-100 rounded-2xl h-32 outline-none focus:border-orange-300 transition-colors" 
              placeholder="今の気持ちをメモ..." 
              value={memo} 
              onChange={(e) => setMemo(e.target.value)} 
            />
            {isFull ? (
              <button onClick={handleHarvest} disabled={isSaving} className="w-full py-5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black rounded-3xl shadow-lg animate-bounce disabled:opacity-50">
                {isSaving ? "クラウドに保存中..." : "🍎 リンゴを収穫する！"}
              </button>
            ) : (
              <button onClick={handleGiveNutrition} disabled={isWatering} className="w-full py-5 bg-orange-500 text-white font-black rounded-3xl shadow-lg hover:bg-orange-600 transition-all">
                {isWatering ? "養分を吸収中..." : "養分を注ぐ 💧"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-white p-8 rounded-[40px] shadow-xl border-4 border-emerald-100 min-h-[480px]">
          <AppleTree level={treeLevel} variety={variety === 'rare' ? 'sun' : variety} hasApple={isFull} moodScore={mood} />
          <div className="mt-8 w-full max-w-xs text-center">
            <div className="flex justify-between text-xs font-black text-emerald-700 mb-2 uppercase tracking-widest">
              <span>Growth</span>
              <span>{nutrition}%</span>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden border-2 border-emerald-50">
              <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${nutrition}%` }} />
            </div>
          </div>
        </div>
      </div>

// gardenページのフッター部分
<footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-md p-4 rounded-full shadow-2xl border border-white/50 flex justify-around items-center z-40">
  <Link href={`/map/${routeId}`} className="flex flex-col items-center gap-1">
    <span className="text-2xl">🗺️</span>
    <span className="text-[10px] font-black text-slate-400">マップ</span>
  </Link>
  {/* routeIdをクエリとして渡すことで、貯蔵庫から戻れるようにする */}
  <Link href={`/collection/${user?.uid || 'guest'}?from=${routeId}`} className="flex flex-col items-center gap-1">
    <span className="text-2xl">📦</span>
    <span className="text-[10px] font-black text-slate-400">貯蔵庫</span>
  </Link>
</footer>

      {showModal && <HarvestModal variety={variety} onClose={handleCloseModal} />}
    </div>
  );
}