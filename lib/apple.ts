// lib/apple.ts
export const getAppleStats = (score: number) => {
  const mapping: Record<number, { color: string; size: number; message: string }> = {
    1: { color: "#888888", size: 60,  message: "今は根を休める時。" },
    2: { color: "#6fa8dc", size: 75,  message: "静かに栄養を蓄えよう。" },
    3: { color: "#ffaa00", size: 90,  message: "着実に育っているよ。" },
    4: { color: "#ff7043", size: 105, message: "いい色がついてきたね！" },
    5: { color: "#ff3333", size: 120, message: "最高の果実だ！" },
  };
  return mapping[score] || mapping[3];
};