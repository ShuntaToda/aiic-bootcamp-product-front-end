// モックレスポンスを生成
function generateMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("su003") || lowerMessage.includes("検索")) {
    return `商品コード「SU003-01137」の検索テストを実行しました。

検索結果: **1件ヒット** ✅

商品が正常に検索できることを確認しました。

<!-- EXECUTION_START -->
## API実行結果

### リクエスト
- **メソッド**: \`GET\`
- **エンドポイント**: \`/api/v1/products/search\`
- **パラメータ**:
\`\`\`json
{
  "query": "SU003-01137",
  "limit": 10
}
\`\`\`

### レスポンス
- **ステータス**: \`200 OK\`
- **レスポンスタイム**: \`45ms\`

\`\`\`json
{
  "total": 1,
  "products": [
    {
      "id": "SU003-01137",
      "name": "スバル純正 デフオイル 75W-90 GL-5",
      "price": 2850,
      "stock": 23,
      "category": "オイル・ケミカル"
    }
  ]
}
\`\`\`

### DB状態
- **テーブル**: \`products\`
- **操作**: \`SELECT\`
- **実行クエリ**: 
\`\`\`sql
SELECT * FROM products 
WHERE product_code LIKE '%SU003-01137%'
LIMIT 10
\`\`\`
- **取得件数**: 1件
<!-- EXECUTION_END -->`;
  }

  if (lowerMessage.includes("在庫") && lowerMessage.includes("5")) {
    return `在庫が5以下の商品のフィルタリングテストを実行しました。

検索結果: **3件ヒット** ✅

在庫数によるフィルタリングが正常に動作しています。

<!-- EXECUTION_START -->
## API実行結果

### リクエスト
- **メソッド**: \`GET\`
- **エンドポイント**: \`/api/v1/products\`
- **パラメータ**:
\`\`\`json
{
  "stock_lte": 5,
  "sort": "stock",
  "order": "asc"
}
\`\`\`

### レスポンス
- **ステータス**: \`200 OK\`
- **レスポンスタイム**: \`62ms\`

\`\`\`json
{
  "total": 3,
  "products": [
    {
      "id": "BR001-00234",
      "name": "ブレーキパッド フロント",
      "price": 8500,
      "stock": 2
    },
    {
      "id": "FI002-00891",
      "name": "エアフィルター",
      "price": 3200,
      "stock": 4
    },
    {
      "id": "OI003-00567",
      "name": "ATFオイル 1L",
      "price": 1800,
      "stock": 5
    }
  ]
}
\`\`\`

### DB状態
- **テーブル**: \`products\`
- **操作**: \`SELECT\`
- **実行クエリ**: 
\`\`\`sql
SELECT * FROM products 
WHERE stock <= 5 
ORDER BY stock ASC
\`\`\`
- **取得件数**: 3件
<!-- EXECUTION_END -->`;
  }

  if (lowerMessage.includes("デフオイル") || lowerMessage.includes("フィルタ")) {
    return `「デフオイル」でのフィルタリングテストを実行しました。

検索結果: **4件ヒット** ✅

商品名によるフィルタリングが正常に動作しています。

<!-- EXECUTION_START -->
## API実行結果

### リクエスト
- **メソッド**: \`GET\`
- **エンドポイント**: \`/api/v1/products\`
- **パラメータ**:
\`\`\`json
{
  "keyword": "デフオイル",
  "category": "オイル・ケミカル"
}
\`\`\`

### レスポンス
- **ステータス**: \`200 OK\`
- **レスポンスタイム**: \`38ms\`

\`\`\`json
{
  "total": 4,
  "products": [
    {
      "id": "SU003-01137",
      "name": "スバル純正 デフオイル 75W-90",
      "price": 2850,
      "stock": 23
    },
    {
      "id": "TO003-02241",
      "name": "トヨタ純正 デフオイル 80W-90",
      "price": 2650,
      "stock": 15
    },
    {
      "id": "NI003-01892",
      "name": "日産純正 デフオイル GL-5",
      "price": 2750,
      "stock": 8
    },
    {
      "id": "HO003-00934",
      "name": "ホンダ純正 デフオイル 90",
      "price": 2500,
      "stock": 31
    }
  ]
}
\`\`\`

### DB状態
- **テーブル**: \`products\`
- **操作**: \`SELECT\`
- **実行クエリ**: 
\`\`\`sql
SELECT * FROM products 
WHERE name LIKE '%デフオイル%'
AND category = 'オイル・ケミカル'
\`\`\`
- **取得件数**: 4件
<!-- EXECUTION_END -->`;
  }

  if (lowerMessage.includes("送料") || lowerMessage.includes("地域")) {
    return `ユーザーの地域による送料表示テストを実行しました。

テスト結果: **3地域で確認完了** ✅

地域ごとに正しい送料が表示されることを確認しました。

<!-- EXECUTION_START -->
## API実行結果

### テストケース 1: 東京都
- **メソッド**: \`GET\`
- **エンドポイント**: \`/api/v1/shipping/calculate\`
- **パラメータ**: \`{ "prefecture": "東京都" }\`
- **レスポンス**: 
\`\`\`json
{ "shipping_fee": 550, "free_shipping_threshold": 5000 }
\`\`\`

### テストケース 2: 北海道
- **メソッド**: \`GET\`
- **エンドポイント**: \`/api/v1/shipping/calculate\`
- **パラメータ**: \`{ "prefecture": "北海道" }\`
- **レスポンス**: 
\`\`\`json
{ "shipping_fee": 1200, "free_shipping_threshold": 10000 }
\`\`\`

### テストケース 3: 沖縄県
- **メソッド**: \`GET\`
- **エンドポイント**: \`/api/v1/shipping/calculate\`
- **パラメータ**: \`{ "prefecture": "沖縄県" }\`
- **レスポンス**: 
\`\`\`json
{ "shipping_fee": 1500, "free_shipping_threshold": 15000 }
\`\`\`

### DB状態
- **テーブル**: \`shipping_rates\`
- **操作**: \`SELECT\`
- **取得件数**: 3件（地域マスタ参照）
<!-- EXECUTION_END -->`;
  }

  if (lowerMessage.includes("ポイント") || lowerMessage.includes("1000円")) {
    return `1000円以上の会計時のポイント利用テストを実行しました。

テスト結果: **条件分岐が正常に動作** ✅

1000円未満の場合はポイント利用不可、1000円以上の場合は利用可能であることを確認しました。

<!-- EXECUTION_START -->
## API実行結果

### テストケース 1: 会計金額 800円（ポイント利用不可）
- **メソッド**: \`POST\`
- **エンドポイント**: \`/api/v1/checkout/validate\`
- **リクエストボディ**:
\`\`\`json
{
  "subtotal": 800,
  "use_points": 100
}
\`\`\`
- **レスポンス**: 
\`\`\`json
{
  "valid": false,
  "error": "POINTS_MIN_ORDER_NOT_MET",
  "message": "ポイントは1000円以上のご注文でご利用いただけます"
}
\`\`\`

### テストケース 2: 会計金額 1500円（ポイント利用可）
- **メソッド**: \`POST\`
- **エンドポイント**: \`/api/v1/checkout/validate\`
- **リクエストボディ**:
\`\`\`json
{
  "subtotal": 1500,
  "use_points": 200
}
\`\`\`
- **レスポンス**: 
\`\`\`json
{
  "valid": true,
  "subtotal": 1500,
  "points_used": 200,
  "total": 1300
}
\`\`\`

### DB状態
- **テーブル**: \`point_settings\`
- **参照値**: \`min_order_amount = 1000\`
<!-- EXECUTION_END -->`;
  }

  return `ご質問を受け付けました。

テストを実行するには、以下のような内容を入力してください：
- 「SU003-01137を検索できるかテストして」
- 「在庫が5以下の商品だけリストアップできる？」
- 「デフオイルだけでフィルタできるかテストして」
- 「ユーザーの地域ごとに送料の表示が変わるかテストして」
- 「1000円以上の会計の時だけポイントが使えるかテストして」`;
}

// メッセージからユーザー入力を抽出
function extractUserMessage(messages: unknown[]): string {
  const lastMessage = messages[messages.length - 1] as {
    role?: string;
    content?: string | Array<{ type: string; text?: string }>;
  };

  if (lastMessage?.role === "user") {
    if (typeof lastMessage.content === "string") {
      return lastMessage.content;
    }
    if (Array.isArray(lastMessage.content)) {
      return lastMessage.content
        .filter((part) => part.type === "text")
        .map((part) => part.text || "")
        .join("");
    }
  }
  return "";
}

// モックモデルを作成（AI SDK 6 互換）
export function createMockModel() {
  return {
    specificationVersion: "v2" as const,
    provider: "mock",
    modelId: "mock-agent",
    defaultObjectGenerationMode: "json" as const,
    supportedUrls: {} as Record<string, RegExp[]>,

    async doGenerate({ prompt }: { prompt: unknown[] }) {
      const userMessage = extractUserMessage(prompt);
      const response = generateMockResponse(userMessage);

      return {
        text: response,
        finishReason: "stop" as const,
        usage: {
          promptTokens: 10,
          completionTokens: response.length,
        },
        rawCall: {
          rawPrompt: prompt,
          rawSettings: {},
        },
      };
    },

    async doStream({ prompt }: { prompt: unknown[] }) {
      const userMessage = extractUserMessage(prompt);
      const response = generateMockResponse(userMessage);

      const stream = new ReadableStream({
        async start(controller) {
          const chunkSize = 10;
          for (let i = 0; i < response.length; i += chunkSize) {
            const chunk = response.slice(i, i + chunkSize);
            controller.enqueue({
              type: "text-delta" as const,
              textDelta: chunk,
            });
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
          controller.enqueue({
            type: "finish" as const,
            finishReason: "stop" as const,
            usage: {
              promptTokens: 10,
              completionTokens: response.length,
            },
          });
          controller.close();
        },
      });

      return {
        stream,
        rawCall: {
          rawPrompt: prompt,
          rawSettings: {},
        },
      };
    },
  };
}
