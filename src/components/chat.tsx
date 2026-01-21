"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Bot,
  User,
  Download,
  Share2,
  Paperclip,
  FileText,
} from "lucide-react";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { ExecutionPanel } from "@/components/execution-panel";
import { parseAgentResponse, parseAgentResponseMultiple } from "@/lib/parse-execution";
import ReactMarkdown from "react-markdown";

// メッセージの型
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // リサイズ機能用のstate
  const [panelWidth, setPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // メッセージが追加されたら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // リサイズハンドラ
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;

      // 最小幅200px、最大幅600pxに制限
      const clampedWidth = Math.min(Math.max(newWidth, 200), 600);
      setPanelWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      // リサイズ中はテキスト選択を無効にする
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
  }, [isResizing]);

  // メッセージをUIMessage形式に変換
  const toUIMessages = useCallback((msgs: Message[]) => {
    return msgs.map((msg) => ({
      id: msg.id,
      role: msg.role,
      parts: [{ type: "text" as const, text: msg.content }],
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // アシスタントメッセージを追加（ストリーミング用）
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      // API Routeを呼び出してストリームを取得
      const allMessages = [...messages, userMessage];
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: toUIMessages(allMessages) }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // ストリームを消費
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: msg.content + text }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: `エラーが発生しました: ${error}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Command+Enter (Mac) または Ctrl+Enter (Windows/Linux) で送信
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // すべてのアシスタントメッセージから実行結果を抽出（履歴として積み重ね）
  const executionHistory = useMemo(() => {
    const assistantMessages = messages.filter((m) => m.role === "assistant");
    const history: Array<{ content: string; timestamp: string }> = [];
    let isLatestInProgress = false;

    assistantMessages.forEach((msg, msgIndex) => {
      // 複数の実行結果ブロックを抽出
      const parsed = parseAgentResponseMultiple(msg.content);

      // 各実行結果ブロックを履歴に追加
      parsed.executionBlocks.forEach((block) => {
        history.push({
          content: block,
          timestamp: `実行 #${history.length + 1}`,
        });
      });

      // 最後のメッセージの場合、進行中かどうかをチェック
      if (msgIndex === assistantMessages.length - 1) {
        isLatestInProgress = parsed.isExecutionInProgress;
      }
    });

    return {
      items: history,
      isInProgress: isLatestInProgress,
    };
  }, [messages]);

  // メッセージの表示用テキストを取得（実行結果部分を除く）
  const getDisplayContent = (message: Message) => {
    if (message.role === "assistant") {
      return parseAgentResponse(message.content).chatContent;
    }
    return message.content;
  };

  return (
    <div ref={containerRef} className="flex h-screen">
      {/* チャットエリア */}
      <div className="flex flex-1 flex-col overflow-hidden bg-background">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-border/40 px-6">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="unison"
              width={24}
              height={24}
              className="h-6 w-6"
            />
            <span className="font-medium">unison</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              保存する
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              共有する
            </Button>
          </div>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="mx-auto max-w-3xl space-y-6 p-6">
            {messages.length === 0 && (
              <div className="flex h-[60vh] flex-col items-center justify-center text-center">
                <Bot className="mb-4 h-16 w-16 text-muted-foreground/30" />
                <h2 className="text-xl font-semibold text-muted-foreground">
                  新しい会話を始めましょう
                </h2>
                <p className="mt-2 text-sm text-muted-foreground/70">
                  テストしたい内容を入力してください
                </p>
              </div>
            )}

            {messages.map((message) => {
              // ローディング中の空のアシスタントメッセージはスキップ（ローディングインジケーターで表示）
              if (message.role === "assistant" && !message.content) {
                return null;
              }
              return (
                <div key={message.id} className="flex gap-4">
                  {message.role === "assistant" && (
                    <Avatar className="h-8 w-8 shrink-0 bg-linear-to-br from-cyan-400 to-blue-500">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`flex-1 ${message.role === "user" ? "ml-12 text-right" : ""}`}
                  >
                    {message.role === "user" ? (
                      <div className="inline-block rounded-2xl bg-primary px-4 py-2 text-left text-primary-foreground">
                        <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-code:rounded prose-code:bg-white/20 prose-code:px-1 prose-code:py-0.5 prose-code:text-primary-foreground prose-code:before:content-none prose-code:after:content-none">
                          <ReactMarkdown>{getDisplayContent(message)}</ReactMarkdown>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-pink-600 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-ul:text-foreground prose-li:text-foreground">
                        <ReactMarkdown>
                          {getDisplayContent(message)}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0 bg-muted">
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}

            {isLoading && messages[messages.length - 1]?.content === "" && (
              <div className="flex gap-4">
                <Avatar className="h-8 w-8 shrink-0 bg-linear-to-br from-cyan-400 to-blue-500">
                  <AvatarFallback className="bg-transparent">
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}

            {/* 自動スクロール用のアンカー */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/40 p-4">
          <div className="mx-auto max-w-3xl">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="テストしたい内容を入力してください... (⌘+Enter / Ctrl+Enter で送信)"
                className="min-h-[100px] resize-none rounded-xl border-border/40 bg-muted/30 pr-32 focus-visible:ring-1"
                rows={3}
              />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
              <Button
                type="submit"
                size="sm"
                className="absolute bottom-3 right-3 gap-2"
                disabled={!input.trim() || isLoading}
              >
                実行
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              ⌘+Enter (Mac) / Ctrl+Enter (Win) で送信 • 結果は右側のパネルに表示されます
            </p>
          </div>
        </div>
      </div>

      {/* リサイズハンドル */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 shrink-0 cursor-col-resize bg-border transition-colors hover:bg-primary/50 active:bg-primary ${isResizing ? "bg-primary" : ""
          }`}
      />

      {/* 実行結果パネル */}
      <div className="shrink-0" style={{ width: panelWidth }}>
        <ExecutionPanel
          history={executionHistory.items}
          isInProgress={executionHistory.isInProgress}
        />
      </div>
    </div>
  );
}

export { ChatComponent as Chat };
