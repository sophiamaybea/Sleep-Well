import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Series list
export function useAtelierSeriesList() {
  return useQuery({
    queryKey: ["/api/atelier/series"],
    queryFn: () => apiRequest("GET", "/api/atelier/series"),
  });
}

// Single series with exercises (gated for free tier)
export function useAtelierSeries(seriesId: string | null) {
  return useQuery({
    queryKey: ["/api/atelier/series", seriesId],
    queryFn: () => apiRequest("GET", `/api/atelier/series/${seriesId}`),
    enabled: !!seriesId,
  });
}

// Save / update a response
export function useAtelierRespond(seriesId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId, content }: { exerciseId: string; content: string }) =>
      apiRequest(`/api/atelier/series/${seriesId}/respond`, {
        method: "POST",
        body: JSON.stringify({ exerciseId, content }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/atelier/series", seriesId] });
    },
  });
}

// Admin: create a new series
export function useAtelierCreateSeries() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiRequest("POST", "/api/atelier/series", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/atelier/series"] });
    },
  });
}
