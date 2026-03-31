import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      // 5-minute staleTime: data is considered fresh for 5 min after fetch.
      // Previously Infinity — which meant all queries (writings, editorial tasks, etc.)
      // would never re-fetch after the first load, causing stale data for collaborative
      // editorial workflows. 5 min is a good balance between freshness and chattiness.
      staleTime: 5 * 60 * 1000,
      // Re-fetch when the user returns to the tab — catches updates made
      // in other tabs or by other editors without requiring a full page reload.
      refetchOnWindowFocus: true,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
