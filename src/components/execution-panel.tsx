"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Clock } from "lucide-react";
import ReactMarkdown, { Components } from "react-markdown";

interface ExecutionPanelProps {
  content: string | null;
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
    // preはcodeコンポーネント内で処理するため、そのまま返す
    return <>{children}</>;
  },
};

export function ExecutionPanel({ content }: ExecutionPanelProps) {
  if (!content) {
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
      <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-600" />
          <span className="font-medium">実行結果</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Just now</span>
        </div>
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="prose prose-sm max-w-none prose-headings:text-base prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-li:my-0">
            <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
