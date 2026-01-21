import { UIMessage } from "ai";
import { fromNodeProviderChain } from "@aws-sdk/credential-providers";
import { BedrockAgentCoreClient, InvokeAgentRuntimeCommand } from "@aws-sdk/client-bedrock-agentcore";

// Node.js runtime を使用（ストリーミング対応）
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// AgentCore用のクライアント
let agentCoreClient: BedrockAgentCoreClient | null = null;

function createAgentCoreClient(): BedrockAgentCoreClient {
  const region = process.env.AWS_REGION || "us-west-2";
  const profile = process.env.AWS_PROFILE;

  const credentials = fromNodeProviderChain({
    profile,
    clientConfig: { region },
  });

  return new BedrockAgentCoreClient({
    region,
    credentials,
  });
}

export async function POST(req: Request) {
  const { messages } = await req.json();
  return handleAgentCoreRequest(messages);
}

// AgentCoreを使用したリクエスト処理
async function handleAgentCoreRequest(messages: UIMessage[]) {
  if (!agentCoreClient) {
    agentCoreClient = createAgentCoreClient();
  }

  const agentRuntimeArn = process.env.AGENT_CORE_RUNTIME_ARN;
  const runtimeSessionId = process.env.AGENT_CORE_SESSION_ID || crypto.randomUUID();

  if (!agentRuntimeArn) {
    return new Response("AGENT_CORE_RUNTIME_ARN is required", { status: 500 });
  }

  // 最新のユーザーメッセージを取得
  const lastMessage = messages[messages.length - 1];
  const inputText =
    lastMessage?.parts
      ?.filter((part: { type: string }) => part.type === "text")
      ?.map((part: { type: string; text?: string }) => part.text || "")
      ?.join("") || "";

  // 会話履歴を構築（コンテキスト用）
  const conversationHistory = messages
    .map((msg) => {
      const text =
        msg.parts
          ?.filter((part: { type: string }) => part.type === "text")
          ?.map((part: { type: string; text?: string }) => part.text || "")
          ?.join("") || "";
      if (!text.trim()) return null;
      return `${msg.role === "user" ? "ユーザー" : "アシスタント"}: ${text}`;
    })
    .filter(Boolean)
    .join("\n");

  console.log("=== AgentCore Request ===");
  console.log("Agent Runtime ARN:", agentRuntimeArn);
  console.log("Session ID:", runtimeSessionId);
  console.log("Input:", inputText);
  console.log("Conversation History:", conversationHistory);
  console.log("=========================");

  // システムプロンプト
  const systemPrompt = `あなたはunisonのAIアシスタントです。車用品専門ECサイトのAPIをテストする支援を行います。

## 基本ルール
- 必ず日本語で回答してください
- 丁寧で分かりやすい説明を心がけてください
- ユーザーの指示に従ってAPIを実行し、結果を報告してください

## 実行結果の出力形式（重要）
あなたがAPI呼び出しを実行した場合は、その結果を以下の形式で出力してください：

<!-- EXECUTION_START -->
## 実行内容
[実行したAPIの説明]

## リクエスト
[HTTPメソッド] [エンドポイント]
[リクエストボディがある場合はJSON形式で表示]

## レスポンス
[APIのレスポンス内容]

## ステータス
[成功/失敗など]
<!-- EXECUTION_END -->

### 重要な注意点
- 実行結果は必ず <!-- EXECUTION_START --> と <!-- EXECUTION_END --> で囲んでください
- ユーザーへの説明や返答は、このマーカーの**外側**に書いてください
- 複数のAPIを実行した場合は、それぞれの結果を別々のブロックで出力してください
- APIを実行していない単純な質問への回答には、このマーカーを使わないでください

---

# 車用品専門ECサイト API仕様書

## 概要
- **ベースURL**: https://5y67wr0uvj.execute-api.ap-northeast-1.amazonaws.com/v1
- **認証**: なし（デモ環境）
- **レスポンス形式**: JSON

## エンドポイント一覧

### 1. ヘルスチェック
- GET / - APIの稼働状況を確認

### 2. 商品管理 (Products)
- GET /products - 全商品を取得
- GET /products/:productId - 特定商品の詳細を取得
- POST /products - 新規商品を作成
- PUT /products/:productId - 商品情報を更新
- DELETE /products/:productId - 商品を削除
- GET /products/search - 商品を検索（クエリ: category, minPrice, maxPrice, minRating, keyword）
- GET /products/recommendations/:productId - おすすめ商品を取得

### 3. カート管理 (Carts)
- GET /carts/:userId - ユーザーのカートを取得
- POST /carts/:userId/items - カートに商品を追加（body: productId, quantity）
- PUT /carts/:userId/items/:productId - カート内商品の数量を更新（body: quantity）
- DELETE /carts/:userId/items/:productId - カートから商品を削除
- DELETE /carts/:userId - カート全体をクリア

### 4. 注文管理 (Orders)
- POST /orders - 注文を作成
- GET /orders/user/:userId - ユーザーの注文履歴を取得
- GET /orders/:orderId - 注文詳細を取得
- PUT /orders/:orderId/status - 注文ステータスを更新（body: status）

### 5. ユーザー管理 (Users)
- GET /users - 全ユーザーを取得
- GET /users/:userId - ユーザー詳細を取得
- GET /users/email/:email - メールアドレスでユーザーを検索
- POST /users - 新規ユーザーを作成
- PUT /users/:userId - ユーザー情報を更新
- DELETE /users/:userId - ユーザーを削除

### 6. レビュー管理 (Reviews)
- GET /reviews/product/:productId - 商品のレビュー一覧を取得
- GET /reviews/user/:userId - ユーザーのレビュー一覧を取得
- POST /reviews - 新規レビューを作成
- PUT /reviews/:productId/:reviewId - レビューを更新
- DELETE /reviews/:productId/:reviewId - レビューを削除
- POST /reviews/:productId/:reviewId/helpful - 「参考になった」をマーク

## カテゴリ一覧
- Tires: タイヤ・ホイール
- Oil: オイル・ケミカル
- Interior: 内装パーツ
- Exterior: 外装パーツ
- Electronics: 電装品
- Maintenance: メンテナンス
- Accessories: アクセサリー

## 注文ステータス
- pending: 注文確定
- processing: 処理中
- shipped: 発送済み
- delivered: 配達完了
- cancelled: キャンセル

---

# データベーススキーマ（DynamoDB）

## 1. Products テーブル
| 属性名 | 型 | 説明 |
|---|---|---|
| productId | String | 商品ID (UUID) |
| name | String | 商品名 |
| description | String | 商品説明 |
| price | Number | 価格（円） |
| stock | Number | 在庫数 |
| category | String | カテゴリ |
| imageUrl | String | 商品画像URL |
| averageRating | Number | 平均評価 (0-5) |
| reviewCount | Number | レビュー数 |
| tags | List<String> | タグ |

## 2. Carts テーブル
| 属性名 | 型 | 説明 |
|---|---|---|
| userId | String | ユーザーID |
| items | List<Map> | カート内商品リスト |
| totalAmount | Number | 合計金額 |

## 3. Orders テーブル
| 属性名 | 型 | 説明 |
|---|---|---|
| orderId | String | 注文ID (UUID) |
| userId | String | ユーザーID |
| items | List<Map> | 注文商品リスト |
| totalAmount | Number | 合計金額 |
| status | String | 注文ステータス |
| shippingAddress | Map | 配送先住所 |

## 4. Users テーブル
| 属性名 | 型 | 説明 |
|---|---|---|
| userId | String | ユーザーID (UUID) |
| email | String | メールアドレス |
| name | String | 氏名 |
| address | Map | 住所 |

## 5. Reviews テーブル
| 属性名 | 型 | 説明 |
|---|---|---|
| productId | String | 商品ID |
| reviewId | String | レビューID (UUID) |
| userId | String | ユーザーID |
| userName | String | ユーザー名 |
| rating | Number | 評価 (0-5) |
| title | String | レビュータイトル |
| comment | String | レビューコメント |
| helpfulCount | Number | 参考になった数 |`;

  // AgentCore形式のペイロード
  const fullPrompt =
    messages.length > 1
      ? `${systemPrompt}\n\n以下は会話履歴です：\n${conversationHistory}`
      : `${systemPrompt}\n\nユーザーの質問: ${inputText}`;

  const payload = new TextEncoder().encode(
    JSON.stringify({
      prompt: fullPrompt,
    })
  );

  const command = new InvokeAgentRuntimeCommand({
    agentRuntimeArn,
    runtimeSessionId,
    contentType: "application/json",
    accept: "text/event-stream",
    payload,
  });

  try {
    const response = await agentCoreClient.send(command);

    console.log("=== AgentCore Response ===");
    console.log("Content-Type:", response.contentType);
    console.log("Status Code:", response.statusCode);
    console.log("Session ID:", response.runtimeSessionId);
    console.log("==========================");

    // ストリーミングレスポンスを返す
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          if (response.response) {
            const webStream = response.response.transformToWebStream();
            const reader = webStream.getReader();
            const decoder = new TextDecoder();

            let chunkCount = 0;
            let buffer = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                console.log(`=== AgentCore Stream Done (${chunkCount} chunks) ===`);
                // 残りのバッファを処理
                if (buffer.trim()) {
                  const text = parseAgentCoreChunk(buffer);
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                }
                break;
              }

              chunkCount++;
              const chunk = decoder.decode(value, { stream: true });
              console.log(`=== AgentCore Chunk ${chunkCount} ===`, chunk.substring(0, 200));

              buffer += chunk;

              // SSE形式のデータをパース（data: で始まる行を処理）
              const lines = buffer.split("\n");
              buffer = lines.pop() || ""; // 最後の不完全な行をバッファに残す

              for (const line of lines) {
                const text = parseAgentCoreChunk(line);
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              }
            }
          } else {
            console.log("=== No response body ===");
            controller.enqueue(encoder.encode("レスポンスが空です"));
          }
          controller.close();
        } catch (error) {
          console.error("AgentCore streaming error:", error);
          controller.enqueue(encoder.encode(`ストリーミングエラー: ${error}`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error: unknown) {
    console.error("AgentCore Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        error: errorMessage,
        message: "AgentCoreへのリクエストに失敗しました",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// AgentCoreのチャンクをパースしてテキストを抽出
function parseAgentCoreChunk(line: string): string | null {
  const trimmed = line.trim();

  // 空行やコメント行をスキップ
  if (!trimmed || trimmed.startsWith(":")) {
    return null;
  }

  // SSE形式: "data: ..." を処理
  if (trimmed.startsWith("data:")) {
    const data = trimmed.slice(5).trim();

    // [DONE] シグナルをスキップ
    if (data === "[DONE]") {
      return null;
    }

    // JSONをパースしてテキストを抽出
    try {
      const json = JSON.parse(data);
      // 様々な形式に対応
      return (
        json.content ||
        json.text ||
        json.message ||
        json.delta?.text ||
        json.delta?.content ||
        json.output?.text ||
        json.output?.content ||
        (typeof json === "string" ? json : null)
      );
    } catch {
      // JSONでない場合はそのまま返す
      return data || null;
    }
  }

  // data: プレフィックスがない場合、JSONとして試みる
  try {
    const json = JSON.parse(trimmed);
    return (
      json.content ||
      json.text ||
      json.message ||
      json.delta?.text ||
      json.delta?.content ||
      json.output?.text ||
      json.output?.content ||
      null
    );
  } catch {
    // JSONでない場合はそのまま返す（プレーンテキスト）
    return trimmed || null;
  }
}
