"use client";

import * as React from "react";
import {
  MessageSquare,
  Briefcase,
  History,
  HelpCircle,
  User,
  ChevronDown,
  Database,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";

// モックデータ: ユースケース
const useCases = [
  {
    name: "AWS Knowledge",
    icon: Database,
    url: "#",
  },
];

// モックデータ: 履歴
const chatHistory = [
  { id: "1", title: "SU003-01137を検索できるか...", url: "#" },
  { id: "2", title: "在庫が5以下の商品だけリスト...", url: "#" },
  { id: "3", title: "「デフオイル」だけでフィルタ...", url: "#" },
  { id: "4", title: "ユーザーの地域ごとに送料の...", url: "#" },
  { id: "5", title: "1000円以上の会計の時だけポ...", url: "#" },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const [historyOpen, setHistoryOpen] = React.useState(true);

  return (
    <Sidebar className="border-r border-border/40" {...props}>
      {/* ヘッダー: ロゴ */}
      <SidebarHeader className="border-b border-border/40 p-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="unison"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl font-bold">unison</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* チャットメニュー */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive>
                <Link href="/">
                  <MessageSquare className="h-4 w-4" />
                  <span>チャット</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* ユースケース */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            ユースケース
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {useCases.map((useCase) => (
                <SidebarMenuItem key={useCase.name}>
                  <SidebarMenuButton asChild>
                    <Link href={useCase.url}>
                      <useCase.icon className="h-4 w-4" />
                      <span>{useCase.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="text-muted-foreground">
                  <Link href="#">
                    <span>すべて表示</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* 履歴 */}
        <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
          <SidebarGroup>
            <CollapsibleTrigger asChild>
              <SidebarGroupLabel className="flex cursor-pointer items-center gap-2 hover:bg-accent/50 rounded-md">
                <History className="h-4 w-4" />
                履歴
                <ChevronDown
                  className={`ml-auto h-4 w-4 transition-transform ${historyOpen ? "" : "-rotate-90"
                    }`}
                />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {chatHistory.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={chat.url}
                          className="truncate text-muted-foreground"
                        >
                          <span className="truncate">{chat.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>

      {/* フッター */}
      <SidebarFooter className="border-t border-border/40">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#">
                <HelpCircle className="h-4 w-4" />
                <span>ヘルプ</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span>アカウント</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-48">
                <DropdownMenuItem disabled>
                  <User className="mr-2 h-4 w-4" />
                  {user?.email || "ゲスト"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
