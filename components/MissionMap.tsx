"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { exportToGoogleTasks } from "@/lib/googleTasks";
import { getGoogleTasksAccessToken } from "@/lib/auth";

type Step = {
  id: string;
  title: string;
  description: string;
  scheduledDay: number;
  done: boolean;
};

type Props = {
  routeId: string;
  goal: string;
  summary: string;
  progress: number;
  steps: Step[];
};

export default function MissionMap({
  routeId,
  goal,
  summary,
  progress,
  steps,
}: Props) {
  const [localSteps, setLocalSteps] = useState(steps);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const router = useRouter();

  const currentProgress =
    localSteps.length === 0
      ? 0
      : Math.round(
          (localSteps.filter((step) => step.done).length / localSteps.length) * 100
        );

  const handleToggle = async (stepId: string) => {
    const updatedSteps = localSteps.map((step) =>
      step.id === stepId ? { ...step, done: !step.done } : step
    );

    setLocalSteps(updatedSteps);
    setLoading(true);

    try {
      const res = await fetch("/api/update-steps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          routeId,
          steps: updatedSteps,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "更新に失敗しました");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleExportToGoogleTasks = async () => {
    setExporting(true);

    try {
      const accessToken = await getGoogleTasksAccessToken();

      if (!accessToken) {
        throw new Error("Google Tasks のアクセストークンを取得できませんでした");
      }

      await exportToGoogleTasks(accessToken, goal, localSteps);

      alert(`「Route & Root: ${goal}」を Google Tasks に書き出しました`);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Google Tasks への書き出しに失敗しました"
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-orange-50 p-8 text-gray-800">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-2 text-4xl font-bold">旅のしおり</h1>
        <h2 className="mb-2 text-2xl font-semibold">{goal}</h2>
        <p className="mb-4 text-gray-700">{summary}</p>

        <div className="mb-8 rounded-xl bg-white p-4 shadow">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold">進捗</p>
            <p className="font-bold text-orange-600">{currentProgress}%</p>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-orange-100">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-500"
              style={{ width: `${currentProgress}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {localSteps.map((step) => (
            <div
              key={step.id}
              className={`rounded-xl border p-4 shadow-sm transition ${
                step.done
                  ? "border-gray-200 bg-gray-50 opacity-70"
                  : "border-orange-200 bg-white"
              }`}
            >
              <div className="mb-2 flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={step.done}
                  disabled={loading}
                  onChange={() => handleToggle(step.id)}
                  className="mt-1 h-5 w-5"
                />
                <div>
                  <p className="text-sm font-semibold text-orange-600">
                    Day {step.scheduledDay}
                  </p>
                  <h3
                    className={`text-lg font-bold ${
                      step.done ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className={step.done ? "text-gray-500" : "text-gray-700"}>
                    {step.description}
                  </p>
                  <p className="mt-1 text-sm">
                    状態: {step.done ? "完了" : "未完了"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            onClick={handleExportToGoogleTasks}
            disabled={exporting}
            className="rounded-xl bg-blue-500 px-6 py-3 font-bold text-white shadow transition hover:bg-blue-600 disabled:opacity-50"
          >
            {exporting ? "書き出し中..." : "Google Tasks に書き出す"}
          </button>

          <Link
            href={`/garden/${routeId}`}
            className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white shadow transition hover:bg-emerald-600"
          >
            果樹園（Garden）へ向かう
          </Link>
        </div>
      </div>
    </main>
  );
}