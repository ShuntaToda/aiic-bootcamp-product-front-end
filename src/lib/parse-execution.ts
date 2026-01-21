// エージェントの応答から実行結果部分を抽出するユーティリティ

const EXECUTION_START = "<!-- EXECUTION_START -->";
const EXECUTION_END = "<!-- EXECUTION_END -->";

export interface ParsedResponse {
  chatContent: string;
  executionContent: string | null;
}

export function parseAgentResponse(response: string): ParsedResponse {
  const startIndex = response.indexOf(EXECUTION_START);
  const endIndex = response.indexOf(EXECUTION_END);

  // マーカーが見つからない場合は全体をチャット内容として返す
  if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
    return {
      chatContent: response,
      executionContent: null,
    };
  }

  // マーカーの前後でコンテンツを分割
  const beforeExecution = response.slice(0, startIndex).trim();
  const executionContent = response.slice(startIndex + EXECUTION_START.length, endIndex).trim();
  const afterExecution = response.slice(endIndex + EXECUTION_END.length).trim();

  // チャット内容を結合（マーカー前後のテキスト）
  const chatContent = [beforeExecution, afterExecution].filter(Boolean).join("\n\n");

  return {
    chatContent,
    executionContent,
  };
}
