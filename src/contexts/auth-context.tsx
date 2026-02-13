"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "driver" | "dispatcher" | "viewer";
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar sesión al cargar
  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("tms_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        localStorage.removeItem("tms_user");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Protección de rutas
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

    if (!user && !isPublicRoute) {
      router.push("/login");
    } else if (user && isPublicRoute) {
      router.push("/");
    }
  }, [user, isLoading, pathname, router]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("tms_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tms_user");
    router.push("/login");
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("tms_user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}
