import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User } from "@shared/models/auth";
async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });
  if (response.status === 401) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
  return response.json();
}
async function loginWithEmail(data: { email: string; password: string }): Promise<any> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Login failed" }));
    throw new Error(err.message || "Login failed");
  }
  return response.json();
}
async function registerWithEmail(data: { email: string; password: string; firstName: string; lastName: string }): Promise<any> {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: "Registration failed" }));
    throw new Error(err.message || "Registration failed");
  }
  return response.json();
}
export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isPending: isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60, // 60s — reduced from 5min (T20)
    refetchOnWindowFocus: true, // T20
    gcTime: 30000, // keep for 30s in cache
  });
  // T50: clear cache BEFORE redirect so cache is clean regardless of how
  // the redirect is triggered (window.location, wouter, or future changes)
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/logout", { method: "GET", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.clear();
      window.location.href = "/";
    },
  });
  const loginMutation = useMutation({
    mutationFn: loginWithEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
  const registerMutation = useMutation({
    mutationFn: registerWithEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
  };
}
