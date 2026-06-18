# Learning Hub — CLAUDE.md

## プロジェクト概要

Google スプレッドシート連携の語学学習 PWA。3つの独立したサブアプリをホーム画面からまとめて起動できる。

- **Word Master** — 英単語・繁体字中文学習（スプレッドシート + Gemini AI）
- **Business Result** — ビジネス英語テキスト学習（ローカルデータ）
- **台湾華語** — 台湾華語学習（ローカルデータ）

## 開発コマンド

```bash
npm run dev        # Vite 開発サーバー起動（port 3000）
npm run build      # tsc && vite build
npm run preview    # ビルド済みをプレビュー
```

dev サーバーが既に起動している可能性があるので、起動前に `netstat` でポート確認推奨。

## アーキテクチャ

```
App.tsx                  # ルーター。activeApp で home/word-master/business/taiwanese を切り替え
├── HomeScreen           # アプリ選択画面
├── WordMasterApp        # App.tsx 内のインライン関数コンポーネント（lazy なし）
├── BusinessResultApp    # lazy import
└── TaiwaneseMandarinApp # lazy import
```

`App.tsx` は 600 行超の大きなファイル。WordMasterApp はここに直書きされており、分離されていない。

## 技術スタック

| 分類 | 内容 |
|---|---|
| フレームワーク | React 19 + TypeScript 5.6 + Vite 6 |
| スタイリング | Tailwind CSS（CDN版） + CSS Modules + カスタム CSS |
| 状態管理 | TanStack React Query v5（localStorage 永続化・7日キャッシュ） |
| AI | Google Generative AI SDK（`@google/genai`）— `gemini-2.5-flash-preview` |
| アイコン | lucide-react（npm） + Tabler Icons（CDN） |
| PWA | vite-plugin-pwa（auto-update） |

**React/その他のライブラリは importmap 経由で ESM CDN からも読み込まれている**（index.html 参照）。Vite のバンドルと両立している特殊構成。

## デザインシステム（Material Design 3）

`styles/md3-tokens.css` がグローバルトークンの基盤。`index.tsx` でインポートされグローバルに適用される。

### カラー体系

| スコープ | ベース | Primary |
|---|---|---|
| グローバル（Word Master） | slate-950 (#020617) | Indigo #818CF8 |
| `.br-root`（Business Result） | slate-950 共通 | Teal #4dbfa3 |
| `.tw-root`（台湾華語） | slate-950 共通 | Red #F87171 |

- **ハードコードの色を使わない**。必ず `var(--md-sys-color-*)` または `var(--color-*)` / `var(--primary)` などのエイリアスを使う。
- Business Result の `--color-*` 変数は `business-result.css` で MD3 トークンのエイリアスとして定義済み。
- 台湾華語の `--primary` / `--surface` 等も同様に `taiwanese-mandarin.css` でエイリアス定義済み。

### フォント

`var(--md-sys-typescale-font-family)` = `'Roboto', 'Noto Sans JP', 'Hiragino Sans', sans-serif`（Google Fonts CDN 読み込み済み）

### シェイプ（border-radius）

```
--md-sys-shape-corner-small: 8px
--md-sys-shape-corner-medium: 12px
--md-sys-shape-corner-large: 16px
--md-sys-shape-corner-extra-large: 28px
--md-sys-shape-corner-full: 9999px
```

Business Result のエイリアス: `--radius-md`(8px) / `--radius-lg`(12px) / `--radius-xl`(16px)

## CSS の使い分け

| ファイル | 対象 | 特徴 |
|---|---|---|
| `styles/md3-tokens.css` | 全体 | MD3 CSS 変数定義。直接編集するのはトークン値のみ |
| `styles/business-result.css` | `.br-root` | MD3 トークンのスコープ上書き + `--color-*` エイリアス |
| `styles/taiwanese-mandarin.css` | `.tw-root` | MD3 トークンのスコープ上書き + `--primary` 等エイリアス |
| `components/business-result/*.module.css` | BR コンポーネント | CSS Modules。`--color-*` 変数を参照 |
| Tailwind クラス（inline） | Word Master / HomeScreen | CDN 版なので `tailwind.config.ts` は存在しない |

## データ構造

### Word Master（スプレッドシート）

`services/spreadsheet.ts` が Google Sheets の公開 CSV を直接 fetch してパース。列の対応:
- B: word, C: translation, D: example, E: notes, F: exampleTranslation, G: _hidden（非表示フラグ）

複数シート（英語・台湾中文など）を `SheetConfig` で管理。設定は App.tsx の `DEFAULT_SHEETS`。

### Business Result（ローカル）

`data/business-result/units.ts` — ユニット一覧（available フラグで公開制御）
`data/business-result/unit*.ts` — 各ユニットの Reading / Vocab / Expressions / Grammar データ
`data/business-result/loader.ts` — ユニット番号からデータを動的 import

### 台湾華語（ローカル）

`data/taiwanese-mandarin/lessons.ts` / `lessons_vol2.ts` / `lessons_vol3.ts`
— `VolumeData` 型でボリューム・レッスン・語彙・文法をまとめて保持

## 環境変数

`vite.config.ts` で `process.env.GEMINI_API_KEY` → `process.env.API_KEY` に expose している。
`.env` ファイルに `GEMINI_API_KEY=...` を設定する。Gemini API は Word Master の単語解説・エッセイ取得で使用。

## 重要な制約・注意点

- **Tailwind は CDN 版** — `tailwind.config.ts` がなく、カスタムテーマ拡張は CSS 変数で行う。
- **importmap を壊さない** — `index.html` の importmap は react / react-dom / lucide-react 等の CDN パスを定義している。npm パッケージを追加した場合は importmap の更新が必要な場合がある。
- **Business Result の `available` フラグ** — `units.ts` の `available: false` のユニットはロック表示になる。新ユニット追加時はここを `true` にして対応データファイルを追加する。
- **音声 API** — `useSpeech.ts`（英語）/ `useSpeechTW.ts`（台湾中文）/ `useSpeechEN.ts` はブラウザの Web Speech API 依存。HTTPS または localhost でのみ動作。
- **スクロール制御** — `Flashcard.tsx` の次へ/前へボタンは意図的にスクロールしないよう実装されている（`scrollIntoView` を削除済み）。
