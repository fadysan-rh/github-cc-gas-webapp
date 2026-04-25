# GAS Web App Skeleton

React + MUI のライトテーマ画面を GAS Web App として即起動できる雛形。
`clasp push && clasp deploy` まで通せば本番URLが手に入る状態にある。

## 構成図

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml   ← main マージで自動デプロイ
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

---

## 環境とデプロイの仕組み

### 2つの環境

| | 開発環境（HEAD） | 本番環境 |
|---|---|---|
| **目的** | 動作確認・テスト | 実際にユーザーが使う |
| **URL** | Apps Script エディタのプレビュー | 固定の Web App URL |
| **更新方法** | `npm run push` | main ブランチへのマージ（自動） |
| **壊れたら** | 気にせず直す | すぐ気づいて戻す |

### コードが本番に届くまでの流れ

```
① 自分のPC でコードを書く
        ↓
② npm run push（コードを GAS に送る）
        ↓
   Apps Script エディタ →「デプロイ」→「テスト デプロイ」
   でプレビュー URL を取得して確認
   （毎回 URL が変わる / push のたびに最新が反映される）
        ↓ 問題なければ
③ GitHub に PR を出す
        ↓
④ PR を main にマージ
        ↓
   GitHub Actions が自動で起動 ★ここは何もしなくていい
        ↓
⑤ 本番 URL に自動で反映される
```

### 自動デプロイの中身（GitHub Actions がやること）

main ブランチにマージされた瞬間、GitHub のサーバーが以下を自動実行する。
手動操作は一切不要。

```
1. コードをチェックアウト
2. npm ci（パッケージ導入）
3. clasp の認証情報を注入（GitHub Secrets から）
4. clasp push（コードを GAS に送る）
5. clasp deploy（本番 URL を新バージョンに更新）
```

### デプロイが成功したか確認する方法

1. GitHub リポジトリの **「Actions」タブ** を開く
2. 一番上の実行結果が **緑のチェックマーク** → 成功
3. **赤い × マーク** → 失敗（Slack 等に通知を飛ばす設定も可能）

```
https://github.com/fadysan-rh/github-cc-gas-webapp/actions
```

### 本番 URL

初回デプロイ（セットアップ⑥）後に取得した URL を以下に記録しておく。

```
https://script.google.com/macros/s/{WEB_APP_URL}/exec
```

---

## 必要なもの（初回セットアップのみ）

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

### ⑧ GitHub Secrets に3つの値を登録する

GitHub Actions が自動デプロイするために必要な情報を登録する。
リポジトリの **「Settings」→「Secrets and variables」→「Actions」** を開き、
以下の3つを「New repository secret」で追加する。

| Secret 名 | 値の取得方法 |
|---|---|
| `CLASPRC_JSON` | ターミナルで `cat ~/.clasprc.json` の出力をまるごとコピー |
| `SCRIPT_ID` | ② でコピーした scriptId |
| `DEPLOYMENT_ID` | ⑥ でメモしたデプロイ ID |

または以下のコマンドで一括登録できる（gh CLI が必要）:

```bash
cat ~/.clasprc.json | gh secret set CLASPRC_JSON --repo {GitHubユーザー名}/{リポジトリ名}
echo -n "$DEPLOYMENT_ID" | gh secret set DEPLOYMENT_ID --repo {GitHubユーザー名}/{リポジトリ名}
# SCRIPT_ID は .clasp.json の scriptId の値
echo -n "{scriptIdの値}" | gh secret set SCRIPT_ID --repo {GitHubユーザー名}/{リポジトリ名}
```

### ⑨ ブラウザで動作確認

```bash
npm run open
```

「GAS Web App is alive」が表示され、ボタンを押すと Snackbar が出れば完成。

---

## 日々の開発フロー

### 通常の機能追加・修正

```bash
# 1. 作業ブランチを作る（ブランチ名は内容がわかるものにする）
git checkout -b feat/〇〇機能

# 2. コードを編集する
#    （src/index.html や src/Code.gs を変更）

# 3. 動作確認（開発プレビューに反映）
npm run push

# 4. 問題なければ GitHub にプッシュ
git add src/          # src/ 以下をまとめて追加（ファイルを絞る場合は個別指定）
git commit -m "feat: 〇〇機能を追加"
git push origin feat/〇〇機能

# 5. GitHub で Pull Request を作成してマージ
#    → 自動で本番デプロイが走る

# 6. マージ後: ローカルのブランチを削除
git checkout main && git pull origin main
git branch -d feat/〇〇機能
```

### コマンドリファレンス

| コマンド | タイミング | 動作 |
|---|---|---|
| `npm run push` | 開発中の確認 | ローカルの変更を GAS の開発プレビューに反映 |
| `npm run deploy` | 緊急で手動デプロイしたいとき | push + 本番URL を即時更新 |
| `npm run open` | 本番確認 | 本番 Web App URL をブラウザで開く |
| `npm run pull` | GAS 側で直接編集した後 | GAS 上の変更をローカルに取り込む |

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

**数ヶ月後に GitHub Actions が失敗し始めたら**
`CLASPRC_JSON` に入っている認証トークンの有効期限が切れている。
ローカルで `clasp login` を再実行し、`cat ~/.clasprc.json` の内容で Secret を上書きする。

---

## 次のステップ

- **Prompt 01（要件定義）**: 画面に載せる具体的な機能をここで決める
- **Prompt 02（Sheets）**: `SpreadsheetApp` でデータ層を追加する
