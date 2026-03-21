import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const { routeId, isPublic, status, abandonReason } = await req.json();
    const routeRef = doc(db, "routes", routeId);

    const updateData: Record<string, any> = {};

    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
      updateData.sharedAt = isPublic ? new Date().toISOString() : null;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    if (abandonReason !== undefined) {
      updateData.abandonReason = abandonReason;
      updateData.abandonedAt = new Date().toISOString();
    }

    await updateDoc(routeRef, updateData);
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: "更新失敗" }, { status: 500 });
  }
}