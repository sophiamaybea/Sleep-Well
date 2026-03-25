import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

async function createOrder(writingId: string) {
  const res = await fetch("/api/gallery-feedback/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ writingId }),
  });
  if (!res.ok) throw new Error("Could not create order");
  return res.json() as Promise<{ orderId: string }>;
}

async function captureOrder(orderId: string) {
  const res = await fetch("/api/gallery-feedback/capture-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ orderId }),
  });
  if (!res.ok) throw new Error("Could not capture order");
  return res.json();
}

export function useGalleryFeedback(writingId: string) {
  const qc = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["gallery-feedback", writingId],
    queryFn: async () => {
      const res = await fetch(`/api/gallery-feedback/${writingId}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Could not fetch feedback status");
      return res.json();
    },
    enabled: !!writingId,
  });

  const createMutation = useMutation({
    mutationFn: (wId: string) => createOrder(wId),
  });

  const captureMutation = useMutation({
    mutationFn: (orderId: string) => captureOrder(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["gallery-feedback", writingId] });
    },
  });

  return { statusQuery, createMutation, captureMutation };
}
