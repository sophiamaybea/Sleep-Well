import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { useAuth } from "./use-auth";

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe("useAuth", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/api/auth/user")) {
        return new Response(JSON.stringify(null), { status: 401 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null user and isAuthenticated=false when the session API returns 401", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("returns the user when the session API returns a user object", async () => {
    const mockUser = { id: "u1", email: "writer@garden.ink", firstName: "Ada", role: "writer" };
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/api/auth/user")) {
        return new Response(JSON.stringify(mockUser), { status: 200 });
      }
      return new Response(JSON.stringify({}), { status: 200 });
    });

    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper() });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.user).toMatchObject({ id: "u1", email: "writer@garden.ink" });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("login() calls POST /api/login with the correct payload", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input, init) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/api/login")) {
        return new Response(JSON.stringify({ message: "Login successful" }), { status: 200 });
      }
      if (url.includes("/api/auth/user")) {
        return new Response(JSON.stringify({ id: "u1", email: "a@b.com" }), { status: 200 });
      }
      return new Response("{}", { status: 200 });
    });

    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.login({ email: "a@b.com", password: "secret" });

    const loginCall = fetchSpy.mock.calls.find(([url]) =>
      (typeof url === "string" ? url : (url as Request).url).includes("/api/login")
    );
    expect(loginCall).toBeDefined();
    expect(loginCall![1]).toMatchObject({
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const body = JSON.parse(loginCall![1]!.body as string);
    expect(body).toEqual({ email: "a@b.com", password: "secret" });
  });

  it("login() throws when the server returns a non-200 response", async () => {
    vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/api/login")) {
        return new Response(JSON.stringify({ message: "Invalid email or password" }), {
          status: 401,
        });
      }
      return new Response(JSON.stringify(null), { status: 401 });
    });

    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await expect(result.current.login({ email: "bad@e.com", password: "wrong" })).rejects.toThrow(
      "Invalid email or password"
    );
  });

  it("register() calls POST /api/register with the correct payload", async () => {
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/api/register")) {
        return new Response(JSON.stringify({ message: "Registration successful" }), { status: 200 });
      }
      if (url.includes("/api/auth/user")) {
        return new Response(JSON.stringify({ id: "u2", email: "new@garden.ink" }), { status: 200 });
      }
      return new Response("{}", { status: 200 });
    });

    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await result.current.register({
      email: "new@garden.ink",
      password: "s33d!",
      firstName: "Ada",
      lastName: "Lovelace",
    });

    const registerCall = fetchSpy.mock.calls.find(([url]) =>
      (typeof url === "string" ? url : (url as Request).url).includes("/api/register")
    );
    expect(registerCall).toBeDefined();
    expect(registerCall![1]).toMatchObject({ method: "POST" });
    const body = JSON.parse(registerCall![1]!.body as string);
    expect(body).toMatchObject({ email: "new@garden.ink", firstName: "Ada", lastName: "Lovelace" });
  });

  it("logout() hits GET /api/logout", async () => {
    const mockUser = { id: "u1", email: "writer@garden.ink" };
    const fetchSpy = vi.spyOn(global, "fetch").mockImplementation(async (input) => {
      const url = typeof input === "string" ? input : (input as Request).url;
      if (url.includes("/api/auth/user")) {
        return new Response(JSON.stringify(mockUser), { status: 200 });
      }
      return new Response("{}", { status: 200 });
    });

    // Suppress navigation side-effect from logout's onSuccess
    const locationSpy = vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      href: "",
    } as Location);

    const { result } = renderHook(() => useAuth(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.logout();

    await waitFor(() => {
      const logoutCall = fetchSpy.mock.calls.find(([url]) =>
        (typeof url === "string" ? url : (url as Request).url).includes("/api/logout")
      );
      expect(logoutCall).toBeDefined();
    });

    locationSpy.mockRestore();
  });
});
