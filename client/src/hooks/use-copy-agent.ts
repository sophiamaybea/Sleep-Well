import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const QUERY_KEYS = {
  copySnapshots: (pageKey?: string) =>
    pageKey ? ["copy-snapshots", pageKey] : ["copy-snapshots"],
  seoMeta: (writingId: string) => ["seo-meta", writingId],
};

// Fetch all copy snapshots, optionally filtered by pageKey
export function useCopySnapshots(pageKey?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.copySnapshots(pageKey),
    queryFn: async () => {
      const url = pageKey
        ? `/api/copy-snapshots?pageKey=${encodeURIComponent(pageKey)}`
        : `/api/copy-snapshots`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch copy snapshots");
      return res.json();
    },
  });
}

// Fetch seo meta for a specific writing
export function useSeoMeta(writingId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.seoMeta(writingId),
    queryFn: async () => {
      const res = await fetch(`/api/seo-meta/${writingId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch seo meta");
      return res.json();
    },
    enabled: !!writingId,
  });
}

// Create a new copy snapshot draft
export function useCreateCopySnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      pageKey: string;
      sectionKey: string;
      draftCopy: string;
    }) => {
      const res = await fetch(`/api/copy-snapshots`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create copy snapshot");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["copy-snapshots"] });
    },
  });
}

// Approve a copy snapshot
export function useApproveCopySnapshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { id: string; approvedCopy?: string }) => {
      const res = await fetch(`/api/copy-snapshots/${data.id}/approve`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvedCopy: data.approvedCopy }),
      });
      if (!res.ok) throw new Error("Failed to approve copy snapshot");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["copy-snapshots"] });
    },
  });
}

// Upsert seo meta for a writing
export function useUpsertSeoMeta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      writingId: string;
      seoTitle?: string;
      seoDescription?: string;
      ogTitle?: string;
      ogDescription?: string;
      displayStandfirst?: string;
    }) => {
      const res = await fetch(`/api/seo-meta`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to upsert seo meta");
      return res.json();
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.seoMeta(vars.writingId) });
    },
  });
}
