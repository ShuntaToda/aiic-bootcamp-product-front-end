// 実行結果の型定義

export interface ExecutionResult {
  id: string;
  timestamp: string;
  api: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    endpoint: string;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response: {
    status: number;
    data: unknown;
  };
  dbState?: {
    table: string;
    operation: "SELECT" | "INSERT" | "UPDATE" | "DELETE";
    affectedRows?: number;
    data?: unknown[];
  };
  duration: number; // ms
}
