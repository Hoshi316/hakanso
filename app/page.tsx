"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // 案内役（ルーター）を呼びます
import Header from "@/components/Header";
import { useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const router = useRouter(); 
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  const [goal, setGoal] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!user) {
      throw new Error("先にログインしてください");
    }
    setLoading(true);
    setError("");

    try {
      // 1. Gemini AI にプランを作ってもらう
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, durationDays, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "プラン生成に失敗しました");

      // 2. 作ってもらったプランを Firestore に保存する
      const saveRes = await fetch("/api/save-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          goal,
          durationDays,
          message,
          summary: data.summary,
          steps: data.steps,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "保存に失敗しました");

      // 3. 保存に成功したら、そのプラン専用のページへ移動する！
      router.push(`/map/${saveData.routeId}`);

    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setLoading(false); // エラーの時だけ loading を解除します
    }
  };

  return (
    <main className="min-h-screen bg-amber-50 p-8 text-gray-800">
      <div className="mx-auto max-w-3xl">

        <h1 className="mb-2 text-4xl font-bold">Route & Root</h1>
        <p className="mb-8 text-lg">目標を入力すると、AI が旅のしおりを作ってくれます。</p>
        <Header />

        <div className="mb-8 rounded-2xl bg-white p-6 shadow">
          {/* 入力項目（ここは前と変わりません） */}
          <div className="mb-4">
            <label className="mb-2 block font-semibold">目標</label>
            <input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded-lg border border-gray-300 p-3" />
          </div>
          <div className="mb-4">
            <label className="mb-2 block font-semibold">何日で達成したい？</label>
            <input type="number" value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 p-3" />
          </div>
          <div className="mb-4">
            <label className="mb-2 block font-semibold">自分への一言</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full rounded-lg border border-gray-300 p-3" rows={4} />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !goal || !user}
            className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "生成中..." : !user ? "ログインしてください" : "旅を始める"}
          </button>
          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>
      </div>
    </main>
  );
}