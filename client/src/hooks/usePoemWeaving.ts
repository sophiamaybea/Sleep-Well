import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api";

export function useWeaves() {
  return useQuery({
    queryKey: ["weaves"],
    queryFn: async () => {
      const res = await fetch(`${API}/weaves`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch weaves");
      return res.json();
    },
  });
}

export function useNationalPoetryDayWeaves() {
  return useQuery({
    queryKey: ["weaves", "national-poetry-day"],
    queryFn: async () => {
      const res = await fetch(`${API}/weaves/national-poetry-day`);
      if (!res.ok) throw new Error("Failed to fetch NPD weaves");
      return res.json();
    },
  });
}

export function useWeave(id: string) {
  return useQuery({
    queryKey: ["weave", id],
    queryFn: async () => {
      const res = await fetch(`${API}/weaves/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch weave");
      return res.json();
    },
    enabled: !!id,
  });
}

export function useCreateWeave() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${API}/weaves`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create weave");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weaves"] }),
  });
}

export function useAddStanza(weaveId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`${API}/weaves/${weaveId}/stanzas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to add stanza");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weave", weaveId] }),
  });
}

export function useInviteToWeave(weaveId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (inviteeId: string) => {
      const res = await fetch(`${API}/weaves/${weaveId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ inviteeId }),
      });
      if (!res.ok) throw new Error("Failed to invite");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weave", weaveId] }),
  });
}

export function useRespondToInvitation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ invitationId, status }: { invitationId: string; status: "accepted" | "declined" }) => {
      const res = await fetch(`${API}/weave-invitations/${invitationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to respond to invitation");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["weaves"] }),
  });
}

export function useHarvestWeave(weaveId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (visibility: "circle" | "garden") => {
      const res = await fetch(`${API}/weaves/${weaveId}/harvest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ visibility }),
      });
      if (!res.ok) throw new Error("Failed to harvest weave");
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weave", weaveId] });
      qc.invalidateQueries({ queryKey: ["weaves"] });
      qc.invalidateQueries({ queryKey: ["writings"] });
    },
  });
}
