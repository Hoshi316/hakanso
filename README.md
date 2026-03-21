# Route & Root

目標達成までのプロセスを「旅」として捉え、日々の感情を「リンゴ」として育てるタスク管理アプリです。

ユーザーが目標を入力すると、AI が3つの異なるスタイルのプランを生成し、ユーザーの過去の学習パターンや最新のWeb情報を踏まえて最適な1つを推薦します。ステップを進めながら、農園でリンゴを育てることで、進捗だけでなく感情の記録も「成長の記録」として残します。

---

## コンセプト

- **Route** = 目標達成までの道のり（AI生成のミッションマップ）
- **Root** = その過程で育つ感情と成長の記録（農園・リンゴ）

うまくいかなかった日や気分が落ち込んだ日も、失敗ではなく「育ち方の違い」として可視化します。

---

## 主な機能

### 目標入力・プラン生成
- 目標・現在地・制約・期間・自分へのメッセージを入力
- Gemini API（Vertex AI）+ Google検索グラウンディングで最新情報を収集してプラン生成
- 3スタイルのプランを提示し、ユーザーの過去の完遂率や難易度データから最適なものをAIが推薦

| スタイル | 特徴 |
|----------|------|
| ⚡ Full Throttle | 最短期間・高密度。速度で圧倒する |
| 🧭 Wayfinder | 希望期間通り・深い理解を重視 |
| 🌊 Flow State | ゆとりを持って・仕組みで続ける |

- 保存前にステップのタイトル・説明・実施日を編集可能
- フェーズ分割（期間に応じて章立て表示）

### ミッションマップ
- ステップを順番に解放するロックシステム（前のステップ完了で次が開く）
- ステップ完了時にフィードバック記録（難易度・やる気・メモ）
- Google Tasks へのエクスポート
- 旅の中断記録（理由と共に保存、次回プランに反映）
- 全ステップ完了時にAI達成診断（振り返り・学習パターン分析・次回への処方箋）

### 農園（Garden）
- リンゴの木を育てる（苗 → 成長 → 木 → 大地に植わったビッグツリー）
- 日々の養分記録：やる気レベル・テキストメモ・写真・音声入力（文字起こし）
- Gemini Visionで画像・メモを解析してリンゴの品種を決定
- 養分100%で収穫 → ログ保存

#### リンゴの品種
通常品種（red / pink / blue / green / yellow / orange / purple / gold）とビッグツリー限定の伝説品種（sakura / nashi / suika / pin）の計12種類

### リンゴ貯蔵庫（Collection）
- 農園とステップそれぞれのリンゴをDay別にグループ表示
- タップで詳細（品種・やる気・メモ・園主の言葉）を確認
- 直売所（Orchard）へのシェア機能

### 直売所（Orchard）
- 他ユーザーのリンゴ・達成記録を閲覧
- 目標キーワードで絞り込み
- 🐝 ミツバチ送信（応援機能）
  - 継続中のルートへ：養分ブースト（+10%/匹）
  - 完遂後のルートへ：情熱の種に変換（次の旅で使用）

### 旅の記録（History）
- 進行中・完了済みをタブ切り替えで表示
- 各ルートからマップ・農園・貯蔵庫へワンタップで移動

---

## 使用技術

| 分類 | 技術 |
|------|------|
| 言語 | TypeScript |
| フレームワーク | Next.js 16（App Router） |
| UI | React 19 + Tailwind CSS v4 |
| AI | Gemini API（@google/genai、Vertex AI） |
| 認証 | Firebase Authentication（Google OAuth） |
| DB | Firestore |
| デプロイ | Vercel |

---

## データ構造

### `routes/{routeId}`

```ts
{
  userId: string
  goal: string
  durationDays: number
  message: string
  summary: string
  steps: Step[]          // { id, title, description, scheduledDay, done }
  phases: Phase[]        // { title, startDay, endDay, description }
  progress: number       // 0〜100
  stepFeedbacks: Feedback[] // ステップ完了時のフィードバック記録
  nutrition: number      // 農園の養分量（0〜100）
  pendingApples: Apple[] // 未収穫リンゴ
  currentVariety: string // 現在の品種
  hasGrown: boolean
  pendingBees: number    // 未受取のミツバチ数
  seeds: number          // 情熱の種（完遂後にミツバチから変換）
  status?: "active" | "abandoned"
  abandonReason?: string
  finalDiagnosis?: string // 達成診断テキスト
  completedAt?: string
}
```

### `logs/{logId}`

```ts
{
  userId: string
  routeId: string
  routeName: string
  moodScore: number      // 1〜5
  note: string
  variety: string        // リンゴの品種
  appleColor: string
  appleSize: number
  comment: string        // 園主の言葉（AI生成）
  source: "garden" | "step"
  stepDay?: number
  stepTitle?: string
  createdAt: string
}
```

### `orchard_posts/{postId}`

直売所への投稿。userId, routeId, goal, comment, variety, diagnosisText, chartData など。

---

## ディレクトリ構成

```
route-and-root/
├── app/
│   ├── page.tsx                    # トップ（目標入力・プラン生成）
│   ├── history/page.tsx            # 旅の記録一覧
│   ├── map/[routeId]/page.tsx      # ミッションマップ
│   ├── garden/[routeId]/page.tsx   # 農園
│   ├── collection/[routeId]/page.tsx  # リンゴ貯蔵庫
│   ├── orchard/page.tsx            # 直売所
│   ├── username-setup/page.tsx     # 初回ユーザー名設定
│   └── api/
│       ├── generate-plan/          # プラン生成（Gemini + Google検索）
│       ├── generate-apple/         # リンゴ品種決定（Gemini Vision）
│       ├── completion-diagnosis/   # 達成診断（Gemini）
│       ├── transcribe-audio/       # 音声文字起こし（Gemini）
│       ├── save-route/             # ルート保存
│       ├── get-route/              # ルート取得
│       ├── update-steps/           # ステップ更新・フィードバック保存
│       ├── update-route-progress/  # 農園進捗保存
│       ├── update-route-status/    # ルートステータス更新
│       ├── save-log/               # 感情ログ保存
│       ├── get-user-logs/          # ログ取得
│       ├── save-user/              # ユーザー保存
│       ├── get-user/               # ユーザー取得
│       ├── send-bee/               # ミツバチ送信
│       └── share-to-orchard/       # 直売所への投稿
├── components/
│   ├── MissionMap.tsx              # ミッションマップUI
│   ├── AppleTree.tsx               # 木の成長アニメーション
│   ├── Apple.tsx                   # リンゴコンポーネント
│   ├── HarvestModal.tsx            # 収穫モーダル
│   └── Header.tsx                  # ヘッダー（認証）
├── lib/
│   ├── firebase.ts
│   ├── firestore.ts
│   ├── auth.ts
│   ├── apple.ts                    # 品種定義・色・説明
│   └── googleTasks.ts
├── types/
│   ├── route.ts
│   └── log.ts
└── public/images/                  # リンゴ・木のSVG画像
```

---

## セットアップ

### 1. リポジトリをクローン

```bash
git clone <リポジトリURL>
cd route-and-root
```

### 2. パッケージをインストール

```bash
npm install
```

### 3. `.env.local` を作成

```env
# Vertex AI（Gemini）
GOOGLE_CLOUD_PROJECT=your_gcp_project_id

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いてください。

---

## デモの流れ

1. Googleアカウントでログイン・ユーザー名を設定
2. 目標・期間・現在地などを入力
3. AIが3つのプランを生成、最適なものを推薦
4. プランを選択（ステップを編集してから開始も可能）
5. ミッションマップでステップを順番に完了
6. 農園でリンゴを育て、日々の気分を記録
7. 収穫したリンゴは貯蔵庫に保存・直売所でシェア
8. 全ステップ完了でAI達成診断を受け取る

---

## メンバー

- ほし
- ゆいのみず