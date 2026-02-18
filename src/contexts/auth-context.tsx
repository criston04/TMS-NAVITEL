"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import type {
  AuthUser,
  UserRole,
  PermissionResource,
  PermissionAction,
} from "@/types/auth";
import { hasPermission, isInGroup, ROLE_GROUPS } from "@/types/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (data: Partial<AuthUser>) => void;
  /** Verifica si el usuario actual tiene un permiso específico */
  can: (resource: PermissionResource, action: PermissionAction) => boolean;
  /** Verifica si el usuario pertenece a alguno de los roles especificados */
  hasRole: (...roles: UserRole[]) => boolean;
  /** Verifica si el usuario pertenece a un grupo de roles */
  inGroup: (group: keyof typeof ROLE_GROUPS) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
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

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem("tms_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tms_user");
    localStorage.removeItem("tms_access_token");
    localStorage.removeItem("tms_refresh_token");
    router.push("/login");
  };

  const updateUser = (data: Partial<AuthUser>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("tms_user", JSON.stringify(updatedUser));
    }
  };

  /** Verifica si el usuario tiene permiso sobre un recurso + acción */
  const can = (resource: PermissionResource, action: PermissionAction): boolean => {
    if (!user) return false;
    return hasPermission(user.role, resource, action, user.permissions);
  };

  /** Verifica si el usuario tiene alguno de los roles especificados */
  const hasRoleFn = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  /** Verifica si el usuario pertenece a un grupo de roles */
  const inGroup = (group: keyof typeof ROLE_GROUPS): boolean => {
    if (!user) return false;
    return isInGroup(user.role, group);
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
        can,
        hasRole: hasRoleFn,
        inGroup,
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
