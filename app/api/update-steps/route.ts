import { updateStepDone } from "@/lib/firestore";

export async function POST(req: Request) {
  try {
    const { routeId, steps, feedback } = await req.json();

    if (!routeId || !steps) {
      return Response.json(
        { error: "routeId と steps は必須です" },
        { status: 400 }
      );
    }

    await updateStepDone(routeId, steps);

    if (feedback) {
  const { db } = await import("@/lib/firebase");
  const { doc, updateDoc, arrayUnion } = await import("firebase/firestore");
  await updateDoc(doc(db, "routes", routeId), {
    stepFeedbacks: arrayUnion({ ...feedback, completedAt: new Date().toISOString() })
  });
}
    return Response.json({ success: true });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "ステップ更新に失敗しました" },
      { status: 500 }
    );
  }
}