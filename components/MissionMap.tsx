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
}: any) {
  const isEditing = editingStepId === step.id;
  const isLeft = index % 2 === 0;
  const depthScale = 1 - (total - 1 - index) * 0.02;

  return (
    <div className={`relative flex items-center py-5 transition-all duration-500 ${unlocked ? "opacity-100" : "opacity-40"}`} 
         style={{ transform: `scaleX(${depthScale})` }}>
      <div className="absolute left-1/2 z-10 -translate-x-1/2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100">
          <div className={`h-4 w-4 rounded-full border-2 transition-all ${
            step.done ? "border-sky-500 bg-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]"
            : unlocked ? "border-sky-300 bg-white" : "border-sky-200 bg-sky-100"
          }`} />
        </div>
      </div>
      <div className={`w-[44%] ${isLeft ? "mr-auto pl-1" : "ml-auto pr-1"}`}>
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
              <div className="flex gap-2">
                <button onClick={onEditSave} className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-bold text-white">保存</button>
                <button onClick={onEditCancel} className="rounded-lg bg-sky-100 px-3 py-1 text-xs text-sky-600">戻る</button>
              </div>
            </div>
          ) : (
            <>
              <h3 className={`text-sm font-black leading-snug ${step.done ? "text-sky-400 line-through" : "text-sky-900"}`}>{step.title}</h3>
              <p className={`mt-1 text-xs leading-relaxed ${step.done ? "text-sky-400" : unlocked ? "text-sky-600" : "text-sky-300"}`}>{step.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <label className={`flex cursor-pointer items-center gap-2 ${!unlocked ? "cursor-not-allowed" : ""}`}>
                  <input type="checkbox" checked={step.done} disabled={loading || !unlocked} onChange={onToggle} className="h-4 w-4 accent-sky-500" />
                  <span className="text-[10px] text-sky-400 font-bold">{step.done ? "完了！" : "完了にする"}</span>
                </label>
                {unlocked && !step.done && <button onClick={onEditStart} className="text-[10px] text-sky-300 underline">編集</button>}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// --- メインコンポーネント ---
export default function MissionMap({ routeId, goal, summary, progress, steps, phases }: Props) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [localSteps, setLocalSteps] = useState(steps);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  const isUnlocked = (stepId: string) => {
    const idx = sortedAsc.findIndex(s => s.id === stepId);
    return idx === 0 ? true : sortedAsc[idx - 1].done;
  };

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
      router.refresh();
    } finally { setLoading(false); }
  };

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

  const handleEditStart = (step: Step) => {
    setEditingStepId(step.id);
    setEditTitle(step.title);
    setEditDescription(step.description);
  };

  const handleEditSave = async (stepId: string) => {
    const updated = localSteps.map(s => s.id === stepId ? { ...s, title: editTitle, description: editDescription } : s);
    updateStepInDB(updated);
    setEditingStepId(null);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = await getGoogleTasksAccessToken();
      if (token) await exportToGoogleTasks(token, goal, localSteps);
      alert("Google Tasksに書き出しました！");
    } finally { setExporting(false); }
  };

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
            </div>
          </div>
        </div>
      </div>

      {/* ── スマホ用固定ナビ ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-sky-100 p-4 flex gap-2 md:hidden">
        <button onClick={handleExport} className="flex-1 rounded-xl bg-sky-100 py-3 text-xs font-bold text-sky-600">Tasks出力</button>
        <Link href={`/garden/${routeId}`} className="flex-[2] rounded-xl bg-emerald-500 py-3 text-center text-xs font-bold text-white shadow-lg">🍎 農園へ向かう</Link>
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