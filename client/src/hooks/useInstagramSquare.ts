import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface InstagramSquareLogPayload {
    writingId?: string;
    title?: string;
    contentSnippet?: string;
    theme: string;
    fontChoice: string;
  }

export function useLogInstagramSquare() {
    const queryClient = useQueryClient();
    return useMutation({
          mutationFn: async (payload: InstagramSquareLogPayload) => {
                  const res = await fetch("/api/instagram-squares/log", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                  if (!res.ok) throw new Error("Failed to log download");
                  return res.json();
                },
          onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["instagram-square-history"] });
                },
        });
  }

export function useInstagramSquareHistory() {
    return useQuery({
          queryKey: ["instagram-square-history"],
          queryFn: async () => {
                  const res = await fetch("/api/instagram-squares/history");
                  if (!res.ok) throw new Error("Failed to fetch history");
                  return res.json();
                },
        });
  }
