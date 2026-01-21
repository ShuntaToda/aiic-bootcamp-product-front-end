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
import { useRef, useEffect, useState } from "react";
import { ExecutionPanel } from "@/components/execution-panel";
import { parseAgentResponse } from "@/lib/parse-execution";
import { generateMockResponse } from "@/lib/mock-responses";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [executionContent, setExecutionContent] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // モックレスポンスを生成（少し遅延を入れてリアル感を出す）
    await new Promise((resolve) => setTimeout(resolve, 500));

    const fullResponse = generateMockResponse(input);
    const parsed = parseAgentResponse(fullResponse);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: parsed.chatContent,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setExecutionContent(parsed.executionContent);
    setIsLoading(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-screen">
      {/* チャットエリア */}
      <div className="flex flex-1 flex-col bg-background">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-border/40 px-6">
          <div className="flex items-center gap-2">
            <span className="font-medium">Amazon Bedrock AgentCore</span>
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
        <ScrollArea ref={scrollRef} className="flex-1">
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

            {messages.map((message) => (
              <div key={message.id} className="flex gap-4">
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 shrink-0 bg-gradient-to-br from-cyan-400 to-blue-500">
                    <AvatarFallback className="bg-transparent">
                      <Bot className="h-4 w-4 text-white" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`flex-1 ${message.role === "user" ? "ml-12 text-right" : ""
                    }`}
                >
                  {message.role === "user" ? (
                    <div className="inline-block rounded-2xl bg-primary px-4 py-2 text-left text-primary-foreground">
                      <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-p:text-primary-foreground prose-strong:text-primary-foreground prose-code:rounded prose-code:bg-white/20 prose-code:px-1 prose-code:py-0.5 prose-code:text-primary-foreground prose-code:before:content-none prose-code:after:content-none">
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      </div>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-pink-600 prose-code:before:content-none prose-code:after:content-none prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-ul:text-foreground prose-li:text-foreground">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
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
            ))}

            {isLoading && (
              <div className="flex gap-4">
                <Avatar className="h-8 w-8 shrink-0 bg-gradient-to-br from-cyan-400 to-blue-500">
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
                placeholder="テストしたい内容を入力してください..."
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
              AIエージェントがAPIを実行し、結果を右側のパネルに表示します
            </p>
          </div>
        </div>
      </div>

      {/* 実行結果パネル */}
      <div className="w-[400px] shrink-0">
        <ExecutionPanel content={executionContent} />
      </div>
    </div>
  );
}
