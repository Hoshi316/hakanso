import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const routeId = searchParams.get("routeId");

  if (!userId || !routeId) {
    return Response.json({ error: "userId と routeId が必要" }, { status: 400 });
  }

  try {
    const q = query(
      collection(db, "logs"),
      where("userId", "==", userId),
      where("routeId", "==", routeId)
    );
    const snap = await getDocs(q);
    const logs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return Response.json({ logs });
  } catch (error) {
    return Response.json({ error: "取得失敗" }, { status: 500 });
  }
}