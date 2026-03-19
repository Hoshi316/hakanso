"use client";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getUserLogs } from "@/lib/firestore";
import { AppleVariety, APPLE_NAMES, APPLE_COLORS } from "@/lib/apple";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type AppleLog = {
  id: string;
  variety: AppleVariety;
  note: string;
  moodScore: number;
  createdAt: string;
  routeId: string;
  routeName?: string;
  comment?: string;
  source?: 'garden' | 'step';
  stepDay?: number | null;
  stepTitle?: string | null;
};

export default function CollectionPage() {
  const params = useParams();
  const routeId = params?.routeId as string;

  const [userId, setUserId] = useState<string | null>(null);
  const [apples, setApples] = useState<AppleLog[]>([]);
  const [routeName, setRouteName] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedApple, setSelectedApple] = useState<AppleLog | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      setUserId(user.uid);

      try {
        // このrouteIdのルート情報を取得
        const routeRes = await fetch(`/api/get-route?routeId=${routeId}`);
        const routeData = await routeRes.json();
        setRouteName(routeData.goal || "");

        // このrouteIdに紐づくログだけ取得
        const logsRes = await fetch(`/api/get-user-logs?userId=${user.uid}&routeId=${routeId}`);
        const logsData = await logsRes.json();
        setApples((logsData.logs || []) as AppleLog[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [routeId]);

  // garden（グリッド） と step（Day別） に分離
  const { gardenApples, stepGroups } = useMemo(() => {
    const gardenApples: AppleLog[] = [];
    const stepGroups: Record<string, AppleLog[]> = {};

    [...apples]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .forEach((apple) => {
        if (apple.source === 'step') {
          const key = apple.stepDay != null
            ? `Day ${apple.stepDay}${apple.stepTitle ? `: ${apple.stepTitle}` : ""}`
            : "その他";
          if (!stepGroups[key]) stepGroups[key] = [];
          stepGroups[key].push(apple);
        } else {
          gardenApples.push(apple);
        }
      });

    return { gardenApples, stepGroups };
  }, [apples]);

  const sortedSteps = Object.entries(stepGroups).sort(([a], [b]) => {
    const dayA = parseInt(a.replace("Day ", "")) || 999;
    const dayB = parseInt(b.replace("Day ", "")) || 999;
    return dayA - dayB;
  });

  const gardenCount = gardenApples.length;
  const stepCount = Object.values(stepGroups).flat().length;

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50">
      <div className="animate-spin h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 p-6 pb-32">
      {/* ヘッダー */}
      <header className="max-w-2xl mx-auto mb-10">
        <p className="text-xs font-black text-stone-300 uppercase tracking-widest mb-2">リンゴ貯蔵庫</p>
        <h1 className="text-2xl font-black text-stone-800 mb-1">📍 {routeName}</h1>
        <p className="text-xs text-stone-400 font-bold">
          農園 {gardenCount}個 ／ ステップ {stepCount}個 ／ 合計 {gardenCount + stepCount}個
        </p>
      </header>

      <div className="max-w-2xl mx-auto space-y-10">

        {/* 農園のリンゴ */}
        {gardenCount > 0 && (
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100">
            <div className="flex items-center gap-2 mb-6">
              <span>🌳</span>
              <span className="text-sm font-black text-emerald-600 uppercase tracking-widest">農園の記録</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-500 font-black px-2 py-0.5 rounded-full border border-emerald-100 ml-auto">{gardenCount}個</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {gardenApples.map((apple) => (
                <button
                  key={apple.id}
                  onClick={() => setSelectedApple(apple)}
                  className="group flex flex-col items-center p-3 rounded-[16px] bg-stone-50 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-all"
                >
                  <img src={`/images/apple-${apple.variety}.svg`} alt={apple.variety} className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                  <span className="mt-1 text-[7px] font-black text-stone-300">
                    {new Date(apple.createdAt).toLocaleDateString("ja-JP", { month: "numeric", day: "numeric" })}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ステップのリンゴ */}
        {stepCount > 0 && (
          <section className="bg-white rounded-[32px] p-6 shadow-sm border border-stone-100">
            <div className="flex items-center gap-2 mb-6">
              <span>🗺️</span>
              <span className="text-sm font-black text-sky-600 uppercase tracking-widest">ステップの記録</span>
              <span className="text-[10px] bg-sky-50 text-sky-500 font-black px-2 py-0.5 rounded-full border border-sky-100 ml-auto">{stepCount}個</span>
            </div>
            <div className="space-y-6">
              {sortedSteps.map(([stepKey, stepApples]) => (
                <div key={stepKey}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[11px] font-black text-sky-500">{stepKey}</span>
                    <div className="flex-1 h-px bg-sky-50" />
                    <span className="text-[10px] text-stone-300">{stepApples.length}個</span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {stepApples.map((apple) => (
                      <button
                        key={apple.id}
                        onClick={() => setSelectedApple(apple)}
                        className="group flex flex-col items-center p-3 rounded-[16px] bg-sky-50/50 hover:bg-sky-100 border border-transparent hover:border-sky-200 transition-all"
                      >
                        <img src={`/images/apple-${apple.variety}.svg`} alt={apple.variety} className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                        <span className="mt-1 text-[7px] font-black text-sky-300">
                          {new Date(apple.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {gardenCount === 0 && stepCount === 0 && (
          <div className="text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-orange-100">
            <p className="text-slate-400 font-bold">まだリンゴがありません。農園で育ててみましょう！</p>
          </div>
        )}
      </div>

      {/* タイムカプセルモーダル */}
      {selectedApple && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={() => setSelectedApple(null)}>
          <div className="bg-white rounded-[40px] max-w-sm w-full overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-center h-40" style={{ backgroundColor: APPLE_COLORS[selectedApple.variety] + "22" }}>
              <img src={`/images/apple-${selectedApple.variety}.svg`} alt={selectedApple.variety} className="w-28 h-28 object-contain drop-shadow-xl" />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-black text-stone-800">{APPLE_NAMES[selectedApple.variety]}</h3>
                  <p className="text-xs text-stone-400 font-bold mt-1">{new Date(selectedApple.createdAt).toLocaleString("ja-JP")}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {selectedApple.moodScore && (
                    <div className="px-3 py-1 rounded-full text-xs font-black" style={{ backgroundColor: APPLE_COLORS[selectedApple.variety] + "22", color: APPLE_COLORS[selectedApple.variety] }}>
                      Lv.{selectedApple.moodScore}
                    </div>
                  )}
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${selectedApple.source === 'step' ? 'bg-sky-50 text-sky-400 border border-sky-100' : 'bg-emerald-50 text-emerald-400 border border-emerald-100'}`}>
                    {selectedApple.source === 'step' ? '🗺️ ステップ' : '🌳 農園'}
                  </span>
                </div>
              </div>

              {selectedApple.stepTitle && (
                <div className="bg-sky-50 rounded-2xl p-3 mb-3 border border-sky-100">
                  <p className="text-[9px] font-black text-sky-300 uppercase mb-1">完了ステップ</p>
                  <p className="text-sm text-sky-700 font-bold">Day {selectedApple.stepDay}: {selectedApple.stepTitle}</p>
                </div>
              )}
              {selectedApple.note && (
                <div className="bg-stone-50 rounded-2xl p-4 mb-3 border border-stone-100">
                  <p className="text-[9px] font-black text-stone-300 uppercase mb-2">メモ</p>
                  <p className="text-sm text-stone-700 font-bold leading-relaxed">{selectedApple.note}</p>
                </div>
              )}
              {selectedApple.comment && (
                <div className="bg-orange-50 rounded-2xl p-4 mb-5 border border-orange-100">
                  <p className="text-[9px] font-black text-orange-300 uppercase mb-2">{selectedApple.source === 'step' ? 'フィードバック' : '園主の言葉'}</p>
                  <p className="text-sm text-stone-600 font-bold italic leading-relaxed">「{selectedApple.comment}」</p>
                </div>
              )}
              <button onClick={() => setSelectedApple(null)} className="w-full py-4 rounded-2xl font-black text-sm text-white" style={{ backgroundColor: APPLE_COLORS[selectedApple.variety] }}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* フッター */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-white/90 backdrop-blur-md p-4 rounded-full shadow-2xl border border-white/50 flex justify-around items-center z-40">
        <Link href={`/garden/${routeId}`} className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
          <span className="text-2xl">🌳</span><span className="text-[10px] font-black text-slate-400">農園</span>
        </Link>
        <Link href={`/map/${routeId}`} className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
          <span className="text-2xl">🗺️</span><span className="text-[10px] font-black text-slate-400">マップ</span>
        </Link>
        <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
          <span className="text-2xl text-white">📦</span>
        </div>
        <Link href="/history" className="flex flex-col items-center gap-1 hover:opacity-70 transition-opacity">
          <span className="text-2xl">📜</span><span className="text-[10px] font-black text-slate-400">履歴</span>
        </Link>
      </footer>
    </div>
  );
}