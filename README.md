# GAS Web App Skeleton

React + MUI のダークテーマ画面を GAS Web App として即起動できる雛形。
`clasp push && clasp deploy` まで通せば本番URLが手に入る状態にある。

## 構成図

```
.
├── .clasp.json
├── .claspignore
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── appsscript.json
    ├── Code.gs
    └── index.html
```

## 必要なもの

- Google アカウント
- Node.js 18 以上
- clasp（グローバルインストール）: `npm i -g @google/clasp`

## セットアップ手順

### ① clasp にログイン

```bash
clasp login
```

ブラウザが開くので Google アカウントで認証する。

### ② Apps Script プロジェクトを作成して scriptId を取得

1. https://script.google.com/home を開く
2. 「新しいプロジェクト」をクリック
3. 作成されたプロジェクトのURLから scriptId をコピーする
   - URL 例: `https://script.google.com/d/**{ここがscriptId}**/edit`

### ③ .clasp.json の SCRIPT_ID を書き換える

```bash
# 例: scriptId が AbCdEfGhIj の場合
sed -i '' 's/{SCRIPT_ID}/AbCdEfGhIj/' .clasp.json
```

または `.clasp.json` をテキストエディタで開き `{SCRIPT_ID}` を貼り付ける。

### ④ 依存パッケージをインストール

```bash
npm install
```

### ⑤ GAS にプッシュ

```bash
npm run push
```

`Pushed X files.` と表示されれば成功。

### ⑥ 初回デプロイ（Web App URL を取得する）

1. https://script.google.com で ⑤ のプロジェクトを開く
2. 右上「デプロイ」→「新しいデプロイ」をクリック
3. 種類: **ウェブ アプリ** を選択
4. 設定:
   - 説明: `initial`
   - 次のユーザーとして実行: **自分**
   - アクセスできるユーザー: **全員**
5. 「デプロイ」をクリックし、表示される **デプロイ ID** と **Web App URL** をメモする

### ⑦ DEPLOYMENT_ID を環境変数に保存

```bash
# ~/.zshrc または ~/.bashrc に追記して永続化する
echo 'export DEPLOYMENT_ID="ここにデプロイIDを貼り付け"' >> ~/.zshrc
source ~/.zshrc
```

### ⑧ ブラウザで動作確認

```bash
npm run open
```

「GAS Web App is alive」が表示され、ボタンを押すと Snackbar が出れば完成。

---

## 日々の運用

| コマンド | 動作 |
|---|---|
| `npm run push` | ローカルの変更を GAS に同期する |
| `npm run deploy` | push + 既存URLのまま本番を更新する |
| `npm run open` | Web App URL をブラウザで開く |
| `npm run pull` | GAS 上の変更をローカルに取り込む |

---

## ハマりどころ

**`clasp deploy` で `-i` を付け忘れると新URLが生成される**
`npm run deploy` は `$DEPLOYMENT_ID` を使って既存デプロイを上書きする。
`DEPLOYMENT_ID` が未設定だと `$DEPLOYMENT_ID` が空になり新URLが作られる。
必ず ⑦ の手順で環境変数を設定すること。

**アクセスを「自分のみ」にすると他人が開けない**
⑥ の設定で「アクセスできるユーザー」を **全員** にすること。
変更後は「新しいデプロイ」ではなく「デプロイを管理 → 編集」で更新する。

**`.clasprc.json` を絶対に Git に上げない**
このファイルには Google OAuth トークンが入っている。
`.gitignore` で除外済みだが `git add -A` 等の操作に注意する。

---

## 次のステップ

- **Prompt 01（要件定義）**: 画面に載せる具体的な機能をここで決める
- **Prompt 02（Sheets）**: `SpreadsheetApp` でデータ層を追加する
