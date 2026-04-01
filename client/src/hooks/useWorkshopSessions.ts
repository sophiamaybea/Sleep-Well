import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useWorkshopSessions() {
  return useQuery({
    queryKey: ["/api/workshop/sessions"],
    queryFn: () => apiRequest("/api/workshop/sessions"),
  });
}

export function useWorkshopSession(id: string | null) {
  return useQuery({
    queryKey: ["/api/workshop/sessions", id],
    queryFn: () => apiRequest(`/api/workshop/sessions/${id}`),
    enabled: !!id,
  });
}

export function useWorkshopExercises(sessionId: string | null) {
  return useQuery({
    queryKey: ["/api/workshop/sessions", sessionId, "exercises"],
    queryFn: () => apiRequest(`/api/workshop/sessions/${sessionId}/exercises`),
    enabled: !!sessionId,
  });
}

export function useJoinSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest(`/api/workshop/sessions/${sessionId}/join`, { method: "POST" }),
    onSuccess: (_data, sessionId) => {
      qc.invalidateQueries({ queryKey: ["/api/workshop/sessions", sessionId] });
    },
  });
}

export function useSubmitWorkshopResponse(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, content }: { exerciseId: string; content: string }) =>
      apiRequest(`/api/workshop/sessions/${sessionId}/respond`, {
        method: "POST",
        body: JSON.stringify({ exerciseId, content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["/api/workshop/sessions", sessionId, "my-responses"],
      });
    },
  });
}
