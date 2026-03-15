// app/garden/[routeId]/page.tsx
"use client";
import { useState, useEffect } from "react";
import AppleTree from "@/components/AppleTree";
import Link from "next/link";

export default function GardenPage() {
  const [nutrition, setNutrition] = useState(0);
  // ★ 追加：木が大人（成木）になったかどうかを管理
  const [isAdult, setIsAdult] = useState(false); 
  
  const [mood, setMood] = useState(3);
  const [memo, setMemo] = useState("");
  const [variety, setVariety] = useState<'sun' | 'moon' | 'midnight' | 'forest'>('forest');
  const [isWatering, setIsWatering] = useState(false);

  // 100%溜まったら実がなる
  const isFull = nutrition >= 100;

  // ★ 修正：木のレベル計算ロジック
  // 一度 isAdult が true になれば、nutrition が 0 になってもレベル 2（木）を維持する
  let treeLevel = 0;
  if (isAdult) {
    treeLevel = 2; // 大人ならずっと 🌳
  } else {
    // まだ子供なら栄養に応じて 🌱 → 🎋 → 🌳
    treeLevel = nutrition < 30 ? 0 : nutrition < 60 ? 1 : 2;
  }

  // 栄養をあげた時に「大人になったか」をチェック
  const handleGiveNutrition = () => {
    setIsWatering(true);
    setTimeout(() => {
      const boost = mood * 5 + (memo.length > 0 ? 10 : 0);
      const newNutrition = Math.min(nutrition + boost, 100);
      setNutrition(newNutrition);

      // ★ 追加：栄養が 60 を超えたら「大人フラグ」をオンにする
      if (newNutrition >= 60) {
        setIsAdult(true);
      }

      // 品種の判定（以前と同じ）
      if (mood >= 4) setVariety('sun');
      else if (mood <= 2) setVariety('midnight');
      else setVariety('forest');

      setIsWatering(false);
    }, 1000);
  };

  const handleHarvest = () => {
    // 収穫処理（LocalStorage保存などはそのまま）
    const newApple = { id: Date.now(), variety, memo, date: new Date().toLocaleDateString() };
    const savedApples = JSON.parse(localStorage.getItem("apple-collection") || "[]");
    localStorage.setItem("apple-collection", JSON.stringify([...savedApples, newApple]));

    alert("リンゴを収穫しました！🍎");
    
    // ★ ポイント：nutrition は 0 にするが、isAdult は true のままなので苗には戻らない
    setNutrition(0); 
    setMemo("");
  };

  // （...以下、return 部分の UI は以前と同じで OK ...）
}