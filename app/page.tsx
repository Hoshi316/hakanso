"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getActiveRoutes } from "@/lib/firestore";
import { RouteDoc } from "@/types/route";
import Link from "next/link";

type RawStep = {
  title: string;
  description: string;
  scheduledDay: number;
};

type Plan = {
  style: "full_throttle" | "wayfinder" | "flow_state";
  styleLabel: string;
  styleEmoji: string;
  philosophy: string;
  tagline: string;
  suitableFor: string;
  tradeoff: string;
  intensityLevel: number;
  recommendedDays: number;
  daysComment: string;
  goal: string;
  summary: string;
  steps: RawStep[];
};

type RouteWithId = RouteDoc & { id: string };

const styleConfig = {
  full_throttle: {
    bg: "border-red-300 bg-red-50",
    badge: "bg-red-100 text-red-700",
    meter: "bg-red-400",
    button: "bg-red-700 hover:bg-red-800",
  },
  wayfinder: {
    bg: "border-blue-300 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    meter: "bg-blue-400",
    button: "bg-blue-700 hover:bg-blue-800",
  },
  flow_state: {
    bg: "border-emerald-300 bg-emerald-50",
    badge: "bg-emerald-100 text-emerald-700",
    meter: "bg-emerald-400",
    button: "bg-emerald-700 hover:bg-emerald-800",
  },
};

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [goal, setGoal] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [activeRoutes, setActiveRoutes] = useState<RouteWithId[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setRoutesLoading(true);
        try {
          const routes = await getActiveRoutes(currentUser.uid);
          // 進行中（progress < 100）を先に、完了済みを後に
          const sorted = routes.sort((a, b) => {
            if (a.progress < 100 && b.progress === 100) return -1;
            if (a.progress === 100 && b.progress < 100) return 1;
            return 0;
          });
          setActiveRoutes(sorted.slice(0, 5)); // 最大5件
        } catch (e) {
          console.error(e);
        } finally {
          setRoutesLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGenerate = async () => {
    if (!user) return;
    setLoading(true);
    setError("");
    setPlans(null);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, durationDays, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "プラン生成に失敗しました");
      setPlans(data.plans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) return;
    setSaving(true);
    try {
      const saveRes = await fetch("/api/save-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          goal: plan.goal,
          durationDays: plan.recommendedDays,
          message,
          summary: plan.summary,
          steps: plan.steps,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "保存に失敗しました");
      router.push(`/map/${saveData.routeId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-amber-50 p-6 text-gray-800">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-4xl font-bold">Route & Root</h1>
        <p className="mb-6 text-lg text-gray-600">
          目標を入力すると、AI が旅のしおりを作ってくれます。
        </p>
        <Header />

        {/* ── 新しい目標入力フォーム ── */}
        {!plans && (
          <div className="rounded-2xl bg-white p-6 shadow">
            <h2 className="mb-4 font-bold text-gray-700">✦ 新しい旅を始める</h2>
            <div className="mb-4">
              <label className="mb-2 block font-semibold">目標</label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3"
                placeholder="例：Blenderで3Dモデリングをマスターする"
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block font-semibold">何日で達成したい？</label>
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>
            <div className="mb-4">
              <label className="mb-2 block font-semibold">自分への一言</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3"
                rows={3}
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !goal || !user}
              className="rounded-xl bg-orange-500 px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading
                ? "3つのプランを生成中..."
                : !user
                ? "ログインしてください"
                : "プランを見る"}
            </button>
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>
        )}

        {/* ── 進行中・過去のルート ── */}
        {user && !plans && (
          <div className="mb-8 mt-6">
            {routesLoading ? (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent" />
              </div>
            ) : activeRoutes.length > 0 ? (
              <div className="rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-700">
                  <span>🗺️</span>
                  <span>あなたの旅</span>
                  <Link
                    href="/history"
                    className="ml-auto text-xs font-normal text-orange-400 underline"
                  >
                    すべて見る
                  </Link>
                </h2>

                <div className="space-y-3">
                  {activeRoutes.map((route) => {
                    const isActive = route.progress < 100;
                    const completedCount = route.steps.filter(
                      (s) => s.done
                    ).length;
                    return (
                      <div
                        key={route.id}
                        className={`rounded-xl border p-4 ${
                          isActive
                            ? "border-orange-200 bg-orange-50"
                            : "border-gray-100 bg-gray-50"
                        }`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {isActive && (
                                <span className="rounded-full bg-orange-400 px-2 py-0.5 text-xs font-bold text-white">
                                  進行中
                                </span>
                              )}
                              {!isActive && (
                                <span className="rounded-full bg-gray-300 px-2 py-0.5 text-xs font-bold text-white">
                                  完了
                                </span>
                              )}
                              <p className="text-sm font-bold text-gray-800">
                                {route.goal}
                              </p>
                            </div>
                            <p className="mt-1 text-xs text-gray-400">
                              {completedCount}/{route.steps.length} ステップ完了
                              　{new Date(route.createdAt).toLocaleDateString("ja-JP")}
                            </p>
                          </div>
                        </div>

                        {/* 進捗バー */}
                        <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-orange-400 transition-all"
                            style={{ width: `${route.progress}%` }}
                          />
                        </div>

                        {/* ジャンプボタン */}
                        <div className="flex gap-2">
                          <Link
                            href={`/map/${route.id}`}
                            className="flex-1 rounded-lg bg-orange-500 py-1.5 text-center text-xs font-bold text-white hover:bg-orange-600 transition"
                          >
                            🗺️ マップへ
                          </Link>
                          <Link
                            href={`/garden/${route.id}`}
                            className="flex-1 rounded-lg bg-emerald-500 py-1.5 text-center text-xs font-bold text-white hover:bg-emerald-600 transition"
                          >
                            🍎 農園へ
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )}

        

        {/* ── プラン選択カード ── */}
        {plans && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">どのルートで旅しますか？</h2>
              <button
                onClick={() => setPlans(null)}
                className="text-sm text-gray-500 underline"
              >
                ← 入力に戻る
              </button>
            </div>
            <div className="space-y-4">
              {plans.map((plan) => {
                const config = styleConfig[plan.style];
                const diff = plan.recommendedDays - durationDays;
                return (
                  <div
                    key={plan.style}
                    className={`rounded-2xl border-2 p-6 ${config.bg}`}
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{plan.styleEmoji}</span>
                        <span className={`rounded-full px-3 py-1 text-sm font-bold ${config.badge}`}>
                          {plan.styleLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="mr-1 text-xs text-gray-400">気合度</span>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <div
                            key={n}
                            className={`h-2 w-4 rounded-full ${
                              n <= plan.intensityLevel ? config.meter : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mb-1 text-lg font-bold text-gray-800">
                      "{plan.philosophy}"
                    </p>
                    <p className={`mb-4 text-sm font-semibold ${config.badge.split(" ")[1]}`}>
                      {plan.tagline}
                    </p>
                    <div className="mb-4 flex items-center gap-3">
                      <div className={`rounded-xl px-4 py-2 text-center ${config.badge}`}>
                        <p className="text-xs font-semibold opacity-70">AI提案期間</p>
                        <p className="text-2xl font-black">
                          {plan.recommendedDays}
                          <span className="text-sm font-normal">日</span>
                        </p>
                      </div>
                      <div className="flex-1">
                        {diff < 0 && (
                          <p className="text-sm font-bold text-red-600">
                            ⚡ 希望より{Math.abs(diff)}日短縮
                          </p>
                        )}
                        {diff === 0 && (
                          <p className="text-sm font-bold text-blue-600">
                            🧭 希望通りの期間
                          </p>
                        )}
                        {diff > 0 && (
                          <p className="text-sm font-bold text-emerald-600">
                            🌊 希望より{diff}日ゆとりを持たせます
                          </p>
                        )}
                        <p className="mt-1 text-xs italic text-gray-500">
                          {plan.daysComment}
                        </p>
                      </div>
                    </div>
                    <div className="mb-4 space-y-1 rounded-xl bg-white/60 p-3 text-sm">
                      <p className="text-gray-600">
                        <span className="font-semibold">👤 向いている人：</span>
                        {plan.suitableFor}
                      </p>
                      <p className="italic text-gray-500">
                        <span className="font-semibold not-italic">⚖️ トレードオフ：</span>
                        {plan.tradeoff}
                      </p>
                    </div>
                    <details className="mb-4">
                      <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-600">
                        ステップを確認する（{plan.steps.length}個）
                      </summary>
                      <div className="mt-2 space-y-1 pl-2">
                        {plan.steps.map((step, i) => (
                          <p key={i} className="text-sm text-gray-600">
                            <span className="font-semibold">
                              Day{step.scheduledDay}
                            </span>
                            {"　"}
                            {step.title}
                          </p>
                        ))}
                      </div>
                    </details>
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      disabled={saving}
                      className={`w-full rounded-xl py-3 font-bold text-white transition ${config.button} disabled:opacity-50`}
                    >
                      {saving ? "準備中..." : "このルートで旅を始める →"}
                    </button>
                  </div>
                );
              })}
            </div>
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </main>
  );
}