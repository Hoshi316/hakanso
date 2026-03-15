// app/collection/[routeId]/page.tsx
//テスト
"use client";
import { useEffect, useState } from "react";
import Apple from "@/components/Apple";
import Link from "next/link";

export default function CollectionPage() {
  const [apples, setApples] = useState<any[]>([]);

  useEffect(() => {
    // 保存されたリンゴを読み込む
    const saved = JSON.parse(localStorage.getItem("apple-collection") || "[]");
    setApples(saved);
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-black text-stone-800">🍎 リンゴ貯蔵庫</h1>
          <Link href="/garden/test" className="text-stone-500 hover:underline">← 農園に戻る</Link>
        </div>

        {apples.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-4 border-dashed border-stone-200">
            <p className="text-stone-400 text-xl">まだ収穫されたリンゴはありません。<br/>農園で養分を注いでみましょう！</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {apples.map((apple) => (
              <div key={apple.id} className="bg-white p-6 rounded-2xl shadow hover:shadow-xl transition-all group relative">
                <Apple variety={apple.variety} size={80} />
                <div className="mt-4 text-center">
                  <p className="text-xs text-stone-400 font-mono">{apple.date}</p>
                  <p className="text-sm font-bold text-stone-700 mt-1 truncate">{apple.variety.toUpperCase()}</p>
                </div>
                
                {/* ホバーでメモを表示する簡易的な仕組み */}
                <div className="absolute inset-0 bg-black/80 text-white p-4 text-xs rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center overflow-hidden">
                  {apple.memo}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}