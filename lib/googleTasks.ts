import { Step } from "@/types/route";

export async function exportToGoogleTasks(
  accessToken: string,
  goal: string,
  steps: Step[]
): Promise<void> {
  const base = "https://tasks.googleapis.com/tasks/v1";
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // 1. タスクリストを作成
  const listRes = await fetch(`${base}/users/@me/lists`, {
    method: "POST",
    headers,
    body: JSON.stringify({ title: `Route & Root: ${goal}` }),
  });

  if (!listRes.ok) {
    const err = await listRes.json();
    throw new Error(err.error?.message ?? "タスクリストの作成に失敗しました");
  }

  const list = await listRes.json();
  const taskListId: string = list.id;

  // 2. stepsを順番に追加
  for (const step of steps) {
    const taskRes = await fetch(`${base}/lists/${taskListId}/tasks`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        title: `Day${step.scheduledDay}: ${step.title}`,
        notes: step.description,
        status: step.done ? "completed" : "needsAction",
      }),
    });

    if (!taskRes.ok) {
      const err = await taskRes.json();
      throw new Error(err.error?.message ?? `ステップ「${step.title}」の追加に失敗しました`);
    }
  }
}