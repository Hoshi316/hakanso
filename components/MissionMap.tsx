"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { exportToGoogleTasks } from "@/lib/googleTasks";
import { getGoogleTasksAccessToken } from "@/lib/auth";

type Step = {
  id: string;
  title: string;
  description: string;
  scheduledDay: number;
  done: boolean;
};

type Phase = {
  title: string;
  startDay: number;
  endDay: number;
  description: string;
};

type Props = {
  routeId: string;
  goal: string;
  summary: string;
  progress: number;
  steps: Step[];
  phases?: Phase[];
};

// --- サブコンポーネント: ステップカード ---
function StepCard({
  step, index, total, unlocked, loading,
  editingStepId, editTitle, editDescription,
  onToggle, onEditStart, onEditSave, onEditCancel,
  onEditTitleChange, onEditDescriptionChange,
<<<<<<< HEAD
}: any) {
=======
}: {
  step: Step; index: number; total: number; unlocked: boolean; loading: boolean;
  editingStepId: string | null; editTitle: string; editDescription: string;
  onToggle: () => void; onEditStart: () => void; onEditSave: () => void;
  onEditCancel: () => void; onEditTitleChange: (v: string) => void;
  onEditDescriptionChange: (v: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
  const isEditing = editingStepId === step.id;
  const isLeft = index % 2 === 0;
  const depthScale = 1 - (total - 1 - index) * 0.02;

  return (
    <div className={`relative flex items-center py-5 transition-all duration-500 ${unlocked ? "opacity-100" : "opacity-40"}`} 
         style={{ transform: `scaleX(${depthScale})` }}>
      <div className="absolute left-1/2 z-10 -translate-x-1/2">
<<<<<<< HEAD
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100">
          <div className={`h-4 w-4 rounded-full border-2 transition-all ${
            step.done ? "border-sky-500 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
            : unlocked ? "border-sky-300 bg-white" : "border-sky-200 bg-sky-100"
=======
        <div className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: "#e0f2fe" }}>
          <div className={`h-4 w-4 rounded-full border-2 transition-all duration-300 ${
            step.done
              ? "border-sky-500 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
              : unlocked ? "border-sky-300 bg-white" : "border-sky-200 bg-sky-100"
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
          }`} />
        </div>
      </div>
      <div className={`w-[44%] ${isLeft ? "mr-auto pl-1" : "ml-auto pr-1"}`}>
<<<<<<< HEAD
        <div className={`rounded-2xl border p-4 transition-all ${
          step.done ? "border-sky-300 bg-sky-100/80 shadow-md"
          : unlocked ? "border-sky-200 bg-white shadow-lg"
          : "border-sky-100 bg-sky-50/60"
        }`}>
          {!unlocked && <p className="mb-1 text-[10px] text-sky-300">🔒 前を完了してください</p>}
          <p className="mb-1 text-[10px] font-bold text-sky-400">Day {step.scheduledDay}</p>
          {isEditing ? (
            <div className="space-y-2">
              <input type="text" value={editTitle} onChange={(e) => onEditTitleChange(e.target.value)} className="w-full rounded-lg border border-sky-300 bg-sky-50 p-2 text-sm font-bold text-sky-900" />
              <textarea value={editDescription} onChange={(e) => onEditDescriptionChange(e.target.value)} className="w-full rounded-lg border border-sky-200 bg-sky-50 p-2 text-xs text-sky-700" rows={2} />
=======
        <div className={`rounded-2xl border p-4 transition-all duration-300 ${
          step.done
            ? "border-sky-300 bg-sky-100/80 shadow-md"
            : unlocked ? "border-sky-200 bg-white shadow-lg"
            : "border-sky-100 bg-sky-50/60"
        }`}>
          {!unlocked && (
            <p className="mb-1 text-xs text-sky-300">🔒 前を完了してください</p>
          )}
          <p className={`mb-1 text-xs font-bold ${
            step.done ? "text-sky-500" : unlocked ? "text-sky-400" : "text-sky-300"
          }`}>
            Day {step.scheduledDay}
          </p>

          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text" value={editTitle}
                onChange={(e) => onEditTitleChange(e.target.value)}
                className="w-full rounded-lg border border-sky-300 bg-sky-50 p-2 text-sm font-bold text-sky-900 focus:outline-none"
              />
              <textarea
                value={editDescription}
                onChange={(e) => onEditDescriptionChange(e.target.value)}
                className="w-full rounded-lg border border-sky-200 bg-sky-50 p-2 text-xs text-sky-700 focus:outline-none"
                rows={2}
              />
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
              <div className="flex gap-2">
                <button onClick={onEditSave} className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-bold text-white">保存</button>
                <button onClick={onEditCancel} className="rounded-lg bg-sky-100 px-3 py-1 text-xs text-sky-600">戻る</button>
              </div>
            </div>
          ) : (
            <>
<<<<<<< HEAD
              <h3 className={`text-sm font-black leading-snug ${step.done ? "text-sky-400 line-through" : "text-sky-900"}`}>{step.title}</h3>
              <p className={`mt-1 text-xs leading-relaxed ${step.done ? "text-sky-400" : unlocked ? "text-sky-600" : "text-sky-300"}`}>{step.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <label className={`flex cursor-pointer items-center gap-2 ${!unlocked ? "cursor-not-allowed" : ""}`}>
                  <input type="checkbox" checked={step.done} disabled={loading || !unlocked} onChange={onToggle} className="h-4 w-4 accent-sky-500" />
                  <span className="text-[10px] text-sky-400 font-bold">{step.done ? "完了！" : "完了にする"}</span>
                </label>
                {unlocked && !step.done && <button onClick={onEditStart} className="text-[10px] text-sky-300 underline">編集</button>}
=======
              <h3 className={`text-sm font-black leading-snug ${
                step.done ? "text-sky-400 line-through" : "text-sky-900"
              }`}>
                {step.title}
              </h3>
              <p className={`mt-1 text-xs leading-relaxed ${
                step.done ? "text-sky-400" : unlocked ? "text-sky-600" : "text-sky-300"
              }`}>
                {step.description}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <label className={`flex cursor-pointer items-center gap-2 ${!unlocked ? "cursor-not-allowed" : ""}`}>
                  <input
                    type="checkbox" checked={step.done}
                    disabled={loading || !unlocked}
                    onChange={onToggle}
                    className="h-4 w-4 accent-sky-500"
                  />
                  <span className="text-xs text-sky-400">
                    {step.done ? "完了！" : "完了にする"}
                  </span>
                </label>
                {unlocked && !step.done && (
                  <button onClick={onEditStart} className="text-xs text-sky-300 underline hover:text-sky-500">
                    編集
                  </button>
                )}
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

<<<<<<< HEAD
// --- メインコンポーネント ---
export default function MissionMap({ routeId, goal, summary, progress, steps, phases }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  
=======
export default function MissionMap({ routeId, goal, summary, progress, steps, phases }: Props) {
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
  const [user, setUser] = useState<User | null>(null);
  const [localSteps, setLocalSteps] = useState(steps);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
<<<<<<< HEAD
  
  // 編集用
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // フィードバック & 診断用
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [pendingStep, setPendingStep] = useState<Step | null>(null);
  const [feedbackData, setFeedbackData] = useState({ difficulty: 3, feeling: "まあまあ", memo: "", energy: 3 });
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [diagnosisText, setDiagnosisText] = useState("");
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);

  // データ整理
  const sortedAsc = [...localSteps].sort((a, b) => a.scheduledDay - b.scheduledDay);
  const sortedSteps = [...sortedAsc].reverse();
  const nextStep = sortedAsc.find(s => !s.done);
  const currentProgress = localSteps.length === 0 ? 0 : Math.round((localSteps.filter(s => s.done).length / localSteps.length) * 100);

  // フェーズの開閉管理
  const [openPhases, setOpenPhases] = useState<Set<number>>(new Set([0]));
=======
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [abandonReason, setAbandonReason] = useState("");
  const [abandoning, setAbandoning] = useState(false);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const sortedAsc = [...localSteps].sort((a, b) => a.scheduledDay - b.scheduledDay);
  const sortedSteps = [...sortedAsc].reverse();

  const [openPhases, setOpenPhases] = useState<Set<number>>(() => {
    if (!phases || phases.length === 0) return new Set([0]);
    const completedDays = sortedAsc.filter(s => s.done).map(s => s.scheduledDay);
    const [showAbandonModal, setShowAbandonModal] = useState(false);
    const [abandonReason, setAbandonReason] = useState("");
    const maxCompletedDay = completedDays.length > 0 ? Math.max(...completedDays) : 0;
    const currentPhaseIndex = phases.findIndex(
      p => maxCompletedDay >= p.startDay && maxCompletedDay <= p.endDay
    );
    return new Set([Math.max(0, currentPhaseIndex)]);
  });

  const togglePhase = (index: number) => {
    setOpenPhases(prev => {
      const next = new Set(prev);
      if (next.has(index)) { next.delete(index); } else { next.add(index); }
      return next;
    });
  };

  const currentProgress = localSteps.length === 0 ? 0
    : Math.round((localSteps.filter(s => s.done).length / localSteps.length) * 100);

  const nextStep = sortedAsc.find(s => !s.done);

  const isUnlocked = (stepId: string) => {
    const idx = sortedAsc.findIndex(s => s.id === stepId);
    if (idx === 0) return true;
    return sortedAsc[idx - 1].done;
  };
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  const isUnlocked = (stepId: string) => {
    const idx = sortedAsc.findIndex(s => s.id === stepId);
    return idx === 0 ? true : sortedAsc[idx - 1].done;
  };

<<<<<<< HEAD
  // --- 診断ロジック ---
  useEffect(() => {
    if (!showDiagnosis || !user) return;
    async function fetchDiagnosis() {
      setDiagnosisLoading(true);
      try {
        const routeRes = await fetch(`/api/get-route?routeId=${routeId}`);
        const routeData = await routeRes.json();
        const logsRes = await fetch(`/api/get-user-logs?userId=${user?.uid}&routeId=${routeId}`);
        const logsData = await logsRes.json();
        
        const feedbacks = (routeData.stepFeedbacks || []).sort((a: any, b: any) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());
        setChartData({
          energies: feedbacks.map((f: any) => f.energy || 3),
          difficulties: feedbacks.map((f: any) => f.difficulty || 3),
          feelings: feedbacks.map((f: any) => f.feeling || "まあまあ"),
        });

        const res = await fetch("/api/completion-diagnosis", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ routeId, goal, appleLogs: logsData.logs || [], stepFeedbacks: routeData.stepFeedbacks || [] }),
        });
        const data = await res.json();
        setDiagnosisText(data.diagnosis);
      } catch (e) { console.error(e); } finally { setDiagnosisLoading(false); }
    }
    fetchDiagnosis();
  }, [showDiagnosis, routeId, goal, user]);

  // --- ステップ操作ハンドラー ---
  const handleToggle = async (stepId: string) => {
    if (!isUnlocked(stepId)) return;
    const target = localSteps.find(s => s.id === stepId);
    if (target && !target.done) {
      setPendingStep(target);
      setShowFeedbackModal(true);
      return;
    }
    updateStepInDB(localSteps.map(s => s.id === stepId ? { ...s, done: false } : s));
  };

  const updateStepInDB = async (updated: Step[]) => {
    setLocalSteps(updated);
    setLoading(true);
    try {
      await fetch("/api/update-steps", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ routeId, steps: updated }) });
=======
  const handleToggle = async (stepId: string) => {
    if (!isUnlocked(stepId)) return;
    const updated = localSteps.map(s => s.id === stepId ? { ...s, done: !s.done } : s);
    setLocalSteps(updated);
    setLoading(true);
    try {
      const res = await fetch("/api/update-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId, steps: updated }),
      });
      if (!res.ok) throw new Error("更新失敗");
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
      router.refresh();
    } finally { setLoading(false); }
  };

<<<<<<< HEAD
  const handleFeedbackSubmit = async () => {
    if (!pendingStep) return;
    setShowFeedbackModal(false);
    const updated = localSteps.map(s => s.id === pendingStep.id ? { ...s, done: true } : s);
    setLocalSteps(updated);
    setLoading(true);
    try {
      await fetch("/api/update-steps", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId, steps: updated, feedback: { stepId: pendingStep.id, stepTitle: pendingStep.title, ...feedbackData } })
      });
      // カラーセラピーに基づいたマッピング（簡単:緑, 普通:青, 難:赤）
      const varietyMap: any = { 2: "green", 3: "blue", 4: "red" };
      await fetch("/api/save-log", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.uid, routeId, routeName: goal, moodScore: feedbackData.energy,
          note: feedbackData.memo || `「${pendingStep.title}」を完了`, 
          variety: varietyMap[feedbackData.difficulty] || "green",
          source: 'step', stepDay: pendingStep.scheduledDay, stepTitle: pendingStep.title
        })
      });
      if (updated.every(s => s.done)) setShowDiagnosis(true);
      else router.refresh();
    } finally { setLoading(false); }
  };

=======
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
  const handleEditStart = (step: Step) => {
    setEditingStepId(step.id);
    setEditTitle(step.title);
    setEditDescription(step.description);
  };

  const handleEditSave = async (stepId: string) => {
<<<<<<< HEAD
    const updated = localSteps.map(s => s.id === stepId ? { ...s, title: editTitle, description: editDescription } : s);
    updateStepInDB(updated);
    setEditingStepId(null);
=======
    const updated = localSteps.map(s =>
      s.id === stepId ? { ...s, title: editTitle, description: editDescription } : s
    );
    setLocalSteps(updated);
    setEditingStepId(null);
    await fetch("/api/update-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeId, steps: updated }),
    });
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = await getGoogleTasksAccessToken();
      if (token) await exportToGoogleTasks(token, goal, localSteps);
      alert("Google Tasksに書き出しました！");
    } finally { setExporting(false); }
  };

<<<<<<< HEAD
  return (
    <div className="min-h-screen bg-sky-50/50 pb-20">
      {/* ── ヘッダー ── */}
      <div className="bg-white border-b border-sky-100 px-6 py-6 shadow-sm sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex-1">
            <Link href="/history" className="text-xs font-bold text-sky-400 hover:text-sky-600 transition">← Back</Link>
            <h1 className="text-xl font-black text-sky-900 md:text-2xl mt-1 flex items-center gap-2">
              🗺️ {goal} <span className="text-sm font-bold text-sky-400 bg-sky-50 px-2 py-0.5 rounded-lg">{currentProgress}%</span>
            </h1>
          </div>
          <div className="flex gap-2">
            <Link href={`/garden/${routeId}`} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white shadow-lg">🍎 農園</Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* ── 左カラム: タスクリスト ── */}
          <div className="md:col-span-2 space-y-4">
            <div className="relative">
              <div className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2 bg-sky-200 top-0 bottom-0" />
              {sortedSteps.map((step, index) => (
                <StepCard 
                  key={step.id} step={step} index={index} total={sortedSteps.length}
                  unlocked={isUnlocked(step.id)} loading={loading}
                  editingStepId={editingStepId} editTitle={editTitle} editDescription={editDescription}
                  onToggle={() => handleToggle(step.id)}
                  onEditStart={() => handleEditStart(step)}
                  onEditSave={() => handleEditSave(step.id)}
                  onEditCancel={() => setEditingStepId(null)}
                  onEditTitleChange={setEditTitle} onEditDescriptionChange={setEditDescription}
                />
              ))}
            </div>
          </div>

          {/* ── 右カラム: サイドバー ── */}
          <div className="hidden md:block">
            <div className="sticky top-28 space-y-4">
              <div className="rounded-2xl border border-sky-200 bg-white p-6 shadow-sm">
                <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest mb-4">Current Progress</p>
                <div className="h-3 w-full overflow-hidden rounded-full bg-sky-100">
                  <div className="h-full bg-gradient-to-r from-sky-400 to-blue-400 transition-all duration-1000" style={{ width: `${currentProgress}%` }} />
                </div>
                <p className="mt-4 text-sm text-sky-700 font-bold leading-relaxed">{summary}</p>
              </div>

              {nextStep && (
                <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-5 shadow-sm">
                  <p className="text-[10px] font-black text-sky-500 uppercase mb-2">🎯 Next Step</p>
                  <p className="text-sm font-black text-sky-900">{nextStep.title}</p>
                  <button onClick={() => handleToggle(nextStep.id)} className="mt-4 w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-white shadow-lg">完了にする</button>
                </div>
              )}
              <button onClick={handleExport} disabled={exporting} className="w-full rounded-xl bg-white border border-sky-200 py-3 text-sm font-bold text-sky-600">📤 Google Tasksへ出力</button>
=======
  const handleAbandon = async () => {
    if (!abandonReason) return;
    setAbandoning(true);
    try {
      await fetch("/api/update-route-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId, status: "abandoned", abandonReason }),
      });
      router.push("/");
    } catch (e) {
      alert("中断処理に失敗しました");
    } finally { setAbandoning(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%)" }}>

      {/* トップバー */}
      <div className="sticky top-0 z-30 w-full px-4 py-3" style={{ backgroundColor: "#e0f2fe" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/history" className="text-xs font-bold text-sky-500 hover:text-sky-700">← 旅の記録</Link>
          <div className="flex-1 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-sky-500">✦ Goal ✦</span>
            <h1 className="text-sm font-black text-sky-900 md:text-base">{goal}</h1>
          </div>
          <span className="text-xs font-bold text-sky-600">{currentProgress}%</span>
        </div>
        <div className="mx-auto mt-2 max-w-6xl">
          <div className="h-1 w-full overflow-hidden rounded-full bg-sky-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-400 transition-all duration-700"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-full h-8"
          style={{ background: "linear-gradient(to bottom, #e0f2fe, transparent)" }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="mx-auto max-w-6xl px-4 pt-6 pb-24 md:grid md:grid-cols-[1fr_320px] md:gap-8 md:pb-8">

        {/* 左カラム：ロードマップ */}
        <div ref={scrollRef} className="relative overflow-y-auto md:h-[calc(100vh-120px)] md:rounded-2xl">
          <div className="relative mx-auto max-w-lg px-2">
            <div
              className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2"
              style={{
                top: 0, bottom: 0,
                background: "linear-gradient(to bottom, rgba(125,211,252,0.1), rgba(125,211,252,0.5) 20%, rgba(125,211,252,0.5) 80%, rgba(125,211,252,0.1))",
              }}
            />
            <div className="flex flex-col">
              {phases && phases.length > 0 ? (
                phases.map((phase, phaseIndex) => {
                  const phaseSteps = sortedSteps.filter(
                    s => s.scheduledDay >= phase.startDay && s.scheduledDay <= phase.endDay
                  );
                  const phaseDone = phaseSteps.filter(s => s.done).length;
                  const phaseTotal = phaseSteps.length;
                  const phaseProgress = phaseTotal === 0 ? 0
                    : Math.round((phaseDone / phaseTotal) * 100);
                  const isOpen = openPhases.has(phaseIndex);
                  const isPhaseCompleted = phaseProgress === 100;

                  return (
                    <div key={phaseIndex} className="mb-4">
                      <button
                        onClick={() => togglePhase(phaseIndex)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-sky-100/80 border border-sky-200 text-left transition hover:bg-sky-200/60"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-lg">
                            {isPhaseCompleted ? "✅" : isOpen ? "📖" : "📕"}
                          </span>
                          <div>
                            <p className="text-sm font-black text-sky-900">{phase.title}</p>
                            <p className="text-xs text-sky-500">
                              Day {phase.startDay} 〜 {phase.endDay}　{phaseDone}/{phaseTotal} 完了
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 rounded-full bg-sky-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-sky-500 transition-all"
                              style={{ width: `${phaseProgress}%` }}
                            />
                          </div>
                          <span className="text-sky-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="mt-2">
                          {phaseSteps.map((step) => {
                            const globalIndex = sortedSteps.findIndex(s => s.id === step.id);
                            return (
                              <StepCard
                                key={step.id} step={step}
                                index={globalIndex} total={sortedSteps.length}
                                unlocked={isUnlocked(step.id)} loading={loading}
                                editingStepId={editingStepId} editTitle={editTitle}
                                editDescription={editDescription}
                                onToggle={() => handleToggle(step.id)}
                                onEditStart={() => handleEditStart(step)}
                                onEditSave={() => handleEditSave(step.id)}
                                onEditCancel={() => setEditingStepId(null)}
                                onEditTitleChange={setEditTitle}
                                onEditDescriptionChange={setEditDescription}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                sortedSteps.map((step, index) => (
                  <StepCard
                    key={step.id} step={step} index={index} total={sortedSteps.length}
                    unlocked={isUnlocked(step.id)} loading={loading}
                    editingStepId={editingStepId} editTitle={editTitle}
                    editDescription={editDescription}
                    onToggle={() => handleToggle(step.id)}
                    onEditStart={() => handleEditStart(step)}
                    onEditSave={() => handleEditSave(step.id)}
                    onEditCancel={() => setEditingStepId(null)}
                    onEditTitleChange={setEditTitle}
                    onEditDescriptionChange={setEditDescription}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* 右カラム：サイドバー（PCのみ） */}
        <div className="hidden md:block">
          <div className="sticky top-[88px] space-y-4">
            <div className="rounded-2xl border border-sky-200 bg-white p-5 shadow-sm">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-sky-400">旅の概要</p>
              <p className="text-sm text-sky-700">{summary}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-sky-400">
                  <span>全体進捗</span>
                  <span className="font-bold text-sky-600">{currentProgress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-400 transition-all duration-700"
                    style={{ width: `${currentProgress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-sky-400">
                  {localSteps.filter(s => s.done).length} / {localSteps.length} ステップ完了
                </p>
              </div>
            </div>

            {nextStep && (
              <div className="rounded-2xl border-2 border-sky-300 bg-sky-50 p-5 shadow-sm">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-sky-500">
                  🎯 次のステップ
                </p>
                <p className="text-xs font-bold text-sky-400">Day {nextStep.scheduledDay}</p>
                <p className="mt-1 text-sm font-black text-sky-900">{nextStep.title}</p>
                <p className="mt-1 text-xs text-sky-600">{nextStep.description}</p>
                <button
                  onClick={() => handleToggle(nextStep.id)}
                  disabled={loading || !isUnlocked(nextStep.id)}
                  className="mt-3 w-full rounded-xl bg-sky-500 py-2 text-xs font-bold text-white transition hover:bg-sky-600 disabled:opacity-40"
                >
                  {isUnlocked(nextStep.id) ? "✓ 完了にする" : "🔒 前のステップを完了してください"}
                </button>
              </div>
            )}

            {currentProgress === 100 && (
              <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-5 text-center">
                <p className="text-2xl">🎉</p>
                <p className="mt-1 text-sm font-black text-emerald-700">旅を完走しました！</p>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={handleExport} disabled={exporting}
                className="w-full rounded-xl bg-blue-500 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {exporting ? "書き出し中..." : "Google Tasks に書き出す"}
              </button>
              <Link
                href={`/garden/${routeId}`}
                className="block w-full rounded-xl bg-emerald-500 py-3 text-center text-sm font-bold text-white transition hover:bg-emerald-600"
              >
                果樹園へ向かう 🍎
              </Link>
              <button
                onClick={() => setShowAbandonModal(true)}
                className="w-full rounded-xl border border-red-200 py-2 text-sm font-bold text-red-400 hover:bg-red-50 transition"
              >
                🏳️ この旅を中断する
              </button>
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
            </div>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      {/* ── スマホ用固定ナビ ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-sky-100 p-4 flex gap-2 md:hidden">
        <button onClick={handleExport} className="flex-1 rounded-xl bg-sky-100 py-3 text-xs font-bold text-sky-600">Tasks出力</button>
        <Link href={`/garden/${routeId}`} className="flex-[2] rounded-xl bg-emerald-500 py-3 text-center text-xs font-bold text-white shadow-lg">🍎 農園へ向かう</Link>
=======
      {/* 中断確認モーダル */}
      {showAbandonModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.6)" }}
          onClick={() => { setShowAbandonModal(false); setAbandonReason(""); }}
        >
          <div
            className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <p className="text-3xl mb-2">🏳️</p>
              <h2 className="text-lg font-black text-slate-800">この旅を中断しますか？</h2>
              <p className="text-xs text-slate-400 mt-1">
                中断の記録は次の旅のプランに活かされます。
              </p>
            </div>
            <p className="text-xs font-bold text-slate-500 mb-3">中断の理由を教えてください</p>
            <div className="space-y-2 mb-6">
              {[
                { value: "time",    label: "⏰ 時間が足りなかった" },
                { value: "hard",    label: "😵 難しすぎた" },
                { value: "bored",   label: "💨 興味が失せた" },
                { value: "changed", label: "🔄 目標が変わった" },
                { value: "other",   label: "💭 その他" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setAbandonReason(value)}
                  className={`w-full rounded-xl px-4 py-3 text-sm font-bold text-left transition ${
                    abandonReason === value
                      ? "bg-red-100 border-2 border-red-400 text-red-700"
                      : "bg-slate-50 border-2 border-transparent text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowAbandonModal(false); setAbandonReason(""); }}
                className="flex-1 rounded-xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 transition"
              >
                続ける
              </button>
              <button
                onClick={handleAbandon}
                disabled={!abandonReason || abandoning}
                className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-40"
              >
                {abandoning ? "処理中..." : "中断する"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SP用下部ボタン */}
      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-6 pt-4 md:hidden"
        style={{ background: "linear-gradient(to top, #ffffff 60%, transparent)" }}
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={handleExport} disabled={exporting}
            className="w-full rounded-xl bg-blue-500 py-3 font-bold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {exporting ? "書き出し中..." : "Google Tasks に書き出す"}
          </button>
          <Link
            href={`/garden/${routeId}`}
            className="w-full rounded-xl bg-emerald-500 py-3 text-center font-bold text-white transition hover:bg-emerald-600"
          >
            果樹園（Garden）へ向かう 🍎
          </Link>
          <Link
            href="/history"
            className="w-full rounded-xl bg-sky-100 py-3 text-center font-bold text-sky-600 transition hover:bg-sky-200"
          >
            📜 旅の記録を見る
          </Link>
          <button
            onClick={() => setShowAbandonModal(true)}
            className="w-full rounded-xl border border-red-200 py-2 font-bold text-red-400 hover:bg-red-50 transition"
          >
            🏳️ この旅を中断する
          </button>
        </div>
>>>>>>> 851ab00b8fd9a01dc1e80cd25818cd3c0c037bce
      </div>

      {/* ── モーダル群 ── */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
             <div className="text-center mb-6"><div className="text-4xl mb-2">✅</div><h2 className="text-lg font-black">お疲れ様でした！</h2></div>
             <div className="space-y-6">
                <div><p className="text-xs font-bold text-slate-500 mb-3 uppercase">手応えはどうでしたか？</p>
                  <div className="flex gap-2">{[2,3,4].map(v => (<button key={v} onClick={() => setFeedbackData(p=>({...p, difficulty:v}))} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs ${feedbackData.difficulty===v ? "border-sky-500 bg-sky-50 text-sky-600" : "border-slate-100 text-slate-400"}`}>{v===2?"😌簡単":v===3?"😐普通":"😵難"}</button>))}</div>
                </div>
                <div><p className="text-xs font-bold text-slate-500 mb-2 uppercase">やる気レベル</p>
                  <input type="range" min="1" max="5" value={feedbackData.energy} onChange={e=>setFeedbackData(p=>({...p, energy:Number(e.target.value)}))} className="w-full accent-sky-500" />
                </div>
                <button onClick={handleFeedbackSubmit} className="w-full py-4 rounded-2xl bg-sky-500 font-black text-white shadow-lg">完了を記録 🍎</button>
                <button onClick={()=>setShowFeedbackModal(false)} className="w-full text-slate-400 text-sm font-bold">戻る</button>
             </div>
          </div>
        </div>
      )}

      {showDiagnosis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white rounded-[40px] p-8 max-w-lg w-full shadow-2xl">
             <div className="text-center mb-6"><div className="text-5xl mb-4">🏆</div><h2 className="text-2xl font-black text-slate-800">旅の完遂！</h2></div>
             {diagnosisLoading ? (
               <div className="text-center py-10"><div className="animate-spin h-10 w-10 border-4 border-sky-500 border-t-transparent rounded-full inline-block" /></div>
             ) : (
               <div className="space-y-6">
                 {chartData && (
                   <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center">
                     <p className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Motivation Chart</p>
                     <div className="flex items-end gap-2 h-24">{chartData.energies.map((e:any, i:number) => (<div key={i} className="flex-1 bg-sky-400 rounded-t-lg" style={{ height: `${e * 20}%` }} />))}</div>
                   </div>
                 )}
                 <div className="bg-sky-50 rounded-3xl p-6 border-2 border-sky-100"><p className="text-sm font-bold leading-relaxed text-slate-700 whitespace-pre-wrap">{diagnosisText}</p></div>
                 <Link href={`/collection/${routeId}`} className="block w-full py-5 rounded-3xl bg-emerald-500 text-center font-black text-white text-lg shadow-xl">貯蔵庫で成果を見る 📦</Link>
               </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}