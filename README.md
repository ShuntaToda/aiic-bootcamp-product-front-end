# unison

AIエージェントによるAPIテスト支援サービス。Amazon Bedrock AgentCoreを活用したフロントエンドアプリケーション。

## セットアップ

### 環境変数の設定

`.env.local` ファイルをプロジェクトルートに作成し、以下の環境変数を設定してください：

```bash
# AWS認証情報
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1

# Bedrockモデル設定（オプション）
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022-v2:0

# モックモード（trueで有効、本番接続時はfalseまたは削除）
USE_MOCK=false
```

### 依存関係のインストール

```bash
pnpm install
```

### 開発サーバーの起動

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## 技術スタック

- **Next.js 15** - Reactフレームワーク
- **Vercel AI SDK 6** - AIチャット機能
- **@ai-sdk/amazon-bedrock** - Amazon Bedrockプロバイダー
- **Tailwind CSS** - スタイリング
- **shadcn/ui** - UIコンポーネント

## 機能

- Amazon Bedrock AgentCoreとのリアルタイムチャット
- 実行結果のMarkdown表示
- モックモードでの開発対応
