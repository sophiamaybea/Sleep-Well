import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useWorkshopSessions() {
  return useQuery({
    queryKey: ["/api/workshop/sessions"],
    queryFn: () =>
      apiRequest("GET", "/api/workshop/sessions").then((r) => r.json()),
  });
}

export function useWorkshopSession(id: string | null) {
  return useQuery({
    queryKey: ["/api/workshop/sessions", id],
    queryFn: () =>
      apiRequest("GET", `/api/workshop/sessions/${id}`).then((r) => r.json()),
    enabled: !!id,
  });
}

export function useWorkshopExercises(sessionId: string | null) {
  return useQuery({
    queryKey: ["/api/workshop/sessions", sessionId, "exercises"],
    queryFn: () =>
      apiRequest(
        "GET",
        `/api/workshop/sessions/${sessionId}/exercises`
      ).then((r) => r.json()),
    enabled: !!sessionId,
  });
}

export function useJoinSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest("POST", `/api/workshop/sessions/${sessionId}/join`),
    onSuccess: (_data: unknown, sessionId: string) => {
      qc.invalidateQueries({ queryKey: ["/api/workshop/sessions", sessionId] });
    },
  });
}

export function useSubmitWorkshopResponse(sessionId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, content }: { exerciseId: string; content: string }) =>
      apiRequest(
        "POST",
        `/api/workshop/sessions/${sessionId}/respond`,
        { exerciseId, content }
      ),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["/api/workshop/sessions", sessionId, "my-responses"],
      });
    },
  });
}
