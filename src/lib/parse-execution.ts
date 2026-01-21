// エージェントの応答から実行結果部分を抽出するユーティリティ
// ストリーミング対応: EXECUTION_STARTが見つかった時点で、EXECUTION_ENDがなくても
// その後のコンテンツを実行結果として返す

const EXECUTION_START = "<!-- EXECUTION_START -->";
const EXECUTION_END = "<!-- EXECUTION_END -->";

export interface ParsedResponse {
  chatContent: string;
  executionContent: string | null;
  isExecutionInProgress: boolean;
}

export interface ParsedMultipleResponse {
  chatContent: string;
  executionBlocks: string[];
  isExecutionInProgress: boolean;
}

// 単一の実行結果を抽出（後方互換性のため維持）
export function parseAgentResponse(response: string): ParsedResponse {
  const result = parseAgentResponseMultiple(response);
  return {
    chatContent: result.chatContent,
    executionContent: result.executionBlocks.length > 0 ? result.executionBlocks[result.executionBlocks.length - 1] : null,
    isExecutionInProgress: result.isExecutionInProgress,
  };
}

// 複数の実行結果ブロックを抽出
export function parseAgentResponseMultiple(response: string): ParsedMultipleResponse {
  const executionBlocks: string[] = [];
  let chatContent = "";
  let isExecutionInProgress = false;
  let remaining = response;

  while (true) {
    const startIndex = remaining.indexOf(EXECUTION_START);

    // EXECUTION_STARTが見つからない場合、残りをチャット内容に追加して終了
    if (startIndex === -1) {
      chatContent += remaining;
      break;
    }

    // EXECUTION_STARTの前のテキストをチャット内容に追加
    chatContent += remaining.slice(0, startIndex);

    // EXECUTION_ENDを探す
    const afterStart = remaining.slice(startIndex + EXECUTION_START.length);
    const endIndex = afterStart.indexOf(EXECUTION_END);

    if (endIndex === -1) {
      // EXECUTION_ENDが見つからない場合（ストリーミング中）
      const executionContent = afterStart.trim();
      if (executionContent) {
        executionBlocks.push(executionContent);
      }
      isExecutionInProgress = true;
      break;
    }

    // 完了したブロックを追加
    const executionContent = afterStart.slice(0, endIndex).trim();
    if (executionContent) {
      executionBlocks.push(executionContent);
    }

    // 残りのテキストを更新
    remaining = afterStart.slice(endIndex + EXECUTION_END.length);
  }

  return {
    chatContent: chatContent.trim(),
    executionBlocks,
    isExecutionInProgress,
  };
}
