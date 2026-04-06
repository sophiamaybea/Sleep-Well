import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface EditorialBrief {
  id: number;
  title: string;
  angle: string;
  moodKeywords: string[];
  targetEmotion: string;
  suggestedLength: string;
  season: string | null;
  isPublished: boolean;
  createdAt: string;
}

export function useEditorialBriefs() {
  return useQuery<EditorialBrief[]>({
    queryKey: ["editorial-briefs"],
    queryFn: async () => {
      const res = await fetch("/api/editorial/briefs", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch editorial briefs");
      return res.json();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useCurrentBrief() {
  return useQuery<EditorialBrief>({
    queryKey: ["editorial-briefs", "current"],
    queryFn: async () => {
      const res = await fetch("/api/editorial/briefs/current", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch current brief");
      return res.json();
    },
    staleTime: 1000 * 60 * 30,
  });
}

export function useGenerateBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/editorial/generate", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate editorial brief");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["editorial-briefs"] });
    },
  });
}

export function usePublishBrief() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (briefId: number) => {
      const res = await fetch(`/api/editorial/briefs/${briefId}/publish`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to publish brief");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["editorial-briefs"] });
    },
  });
}
