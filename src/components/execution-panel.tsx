"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Loader2, ChevronDown, ChevronRight } from "lucide-react";
import ReactMarkdown, { Components } from "react-markdown";
import { useState, useEffect, useRef } from "react";

interface ExecutionItem {
  content: string;
  timestamp: string;
}

interface ExecutionPanelProps {
  history: ExecutionItem[];
  isInProgress?: boolean;
}

// カスタムコードブロックコンポーネント
const markdownComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const isBlock = String(children).includes("\n");

    if (isBlock || match) {
      const language = match?.[1] || "";
      return (
        <div className="my-2 overflow-hidden rounded-lg border border-slate-700">
          {language && (
            <div className="bg-slate-700 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {language}
            </div>
          )}
          <pre className="m-0! rounded-none! bg-slate-800 p-3 text-xs">
            <code className="bg-transparent! p-0! text-slate-100" {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    }

    // インラインコード
    return (
      <code className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-mono text-pink-600" {...props}>
        {children}
      </code>
    );
  },
  pre({ children }) {
    return <>{children}</>;
  },
};

// 個別の実行結果アイテム
function ExecutionItem({
  item,
  isLatest,
  isInProgress,
}: {
  item: ExecutionItem;
  isLatest: boolean;
  isInProgress: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`border-b border-slate-200 ${isLatest ? "bg-white" : "bg-slate-50/50"}`}>
      {/* ヘッダー */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-4 py-2 text-left hover:bg-slate-100 transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="h-3 w-3 text-slate-500" />
        ) : (
          <ChevronRight className="h-3 w-3 text-slate-500" />
        )}
        <div className="flex items-center gap-2">
          {isLatest && isInProgress ? (
            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
          ) : (
            <Terminal className="h-3 w-3 text-green-600" />
          )}
          <span className="text-xs font-medium text-slate-700">{item.timestamp}</span>
        </div>
        {isLatest && isInProgress && (
          <span className="ml-auto text-xs text-blue-600">実行中...</span>
        )}
      </button>

      {/* コンテンツ */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="prose prose-sm max-w-none prose-headings:text-sm prose-headings:font-semibold prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-p:text-slate-700">
            <ReactMarkdown components={markdownComponents}>{item.content}</ReactMarkdown>
          </div>
          {isLatest && isInProgress && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>出力中...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExecutionPanel({ history, isInProgress = false }: ExecutionPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // 新しい実行結果が追加されたら自動スクロール
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex h-screen flex-col border-l bg-slate-50">
        <div className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">実行結果</span>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">
          <p className="text-center text-sm text-muted-foreground">
            エージェントがAPIを実行すると
            <br />
            ここに結果が表示されます
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col border-l bg-slate-50">
      {/* ヘッダー */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          {isInProgress ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          ) : (
            <Terminal className="h-4 w-4 text-green-600" />
          )}
          <span className="font-medium">実行結果</span>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs text-slate-600">
            {history.length}件
          </span>
        </div>
        {isInProgress && (
          <span className="text-xs text-blue-600">実行中...</span>
        )}
      </div>

      {/* 実行履歴リスト */}
      <ScrollArea className="flex-1 min-h-0">
        <div ref={scrollRef}>
          {history.map((item, index) => (
            <ExecutionItem
              key={index}
              item={item}
              isLatest={index === history.length - 1}
              isInProgress={isInProgress && index === history.length - 1}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
