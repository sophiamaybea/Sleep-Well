import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useFeed() {
  return useQuery({
    queryKey: ["feed-events"],
    queryFn: async () => {
      const res = await fetch("/api/feed", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch feed");
      return res.json();
    },
    refetchInterval: 60_000, // refresh every 60 seconds
  });
}

export function useFeedUnreadCount() {
  return useQuery({
    queryKey: ["feed-unread-count"],
    queryFn: async () => {
      const res = await fetch("/api/feed/unread-count", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch unread count");
      return res.json() as Promise<{ count: number }>;
    },
    refetchInterval: 30_000,
  });
}

export function useMarkFeedEventRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (eventId: string) => {
      const res = await fetch(`/api/feed/events/${eventId}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-events"] });
      qc.invalidateQueries({ queryKey: ["feed-unread-count"] });
    },
  });
}

export function useMarkAllFeedRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/feed/read-all", {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark all as read");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feed-events"] });
      qc.invalidateQueries({ queryKey: ["feed-unread-count"] });
    },
  });
}
