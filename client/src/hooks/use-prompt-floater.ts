import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface PromptSuggestion {
  id: number;
  prompt: string;
  category: string;
  tone: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

export function usePromptSuggestions() {
  return useQuery<PromptSuggestion[]>({
    queryKey: ["prompt-suggestions"],
    queryFn: async () => {
      const res = await fetch("/api/prompts/suggestions", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch prompt suggestions");
      return res.json();
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useRefreshPrompts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/prompts/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to refresh prompts");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompt-suggestions"] });
    },
  });
}

export function useRecordPromptUse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (promptId: number) => {
      const res = await fetch(`/api/prompts/${promptId}/use`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to record prompt use");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["prompt-suggestions"] });
    },
  });
}
