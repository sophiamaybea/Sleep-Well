import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type WritingLayout = "single" | "two-column";

async function fetchWritingLayout(writingId: string): Promise<{ layout: WritingLayout }> {
  const res = await fetch(`/api/editor/writing-layout/${writingId}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Could not fetch layout");
  return res.json();
}

async function updateWritingLayout(writingId: string, layout: WritingLayout) {
  const res = await fetch(`/api/editor/writing-layout/${writingId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ layout }),
  });
  if (!res.ok) throw new Error("Could not update layout");
  return res.json();
}

export function useWritingLayout(writingId: string) {
  const qc = useQueryClient();

  const layoutQuery = useQuery({
    queryKey: ["writing-layout", writingId],
    queryFn: () => fetchWritingLayout(writingId),
    enabled: !!writingId,
  });

  const toggleLayoutMutation = useMutation({
    mutationFn: (newLayout: WritingLayout) =>
      updateWritingLayout(writingId, newLayout),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["writing-layout", writingId] });
    },
  });

  const currentLayout: WritingLayout = layoutQuery.data?.layout ?? "single";

  const toggleLayout = () => {
    const next: WritingLayout = currentLayout === "single" ? "two-column" : "single";
    toggleLayoutMutation.mutate(next);
  };

  return {
    layout: currentLayout,
    isLoading: layoutQuery.isLoading,
    toggleLayout,
    isToggling: toggleLayoutMutation.isPending,
  };
}
