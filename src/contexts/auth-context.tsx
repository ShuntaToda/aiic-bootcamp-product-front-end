"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email?: string, password?: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // クライアントサイドでマウント後にlocalStorageから復元
    const initAuth = () => {
      const savedUser = localStorage.getItem("mock-user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem("mock-user");
        }
      }
      setIsLoading(false);
    };
    // 非同期で実行してリンターエラーを回避
    Promise.resolve().then(initAuth);
  }, []);

  const login = async (email?: string, _password?: string) => {
    void _password;
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockUser: User = {
      name: email ? email.split("@")[0] : "ゲストユーザー",
      email: email || "guest@example.com",
    };

    setUser(mockUser);
    localStorage.setItem("mock-user", JSON.stringify(mockUser));
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("mock-user");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
