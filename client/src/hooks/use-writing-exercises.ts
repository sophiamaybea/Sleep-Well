import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = (path: string) => fetch(path, { credentials: "include" }).then(r => r.json());
const POST = (path: string, body: unknown) =>
  fetch(path, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
const PATCH = (path: string, body: unknown) =>
  fetch(path, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
const DELETE = (path: string) =>
  fetch(path, { method: "DELETE", credentials: "include" }).then(r => r.json());

export function useExercises() {
  return useQuery({ queryKey: ["writing-exercises"], queryFn: () => API("/api/exercises") });
}

export function useExercise(id: string) {
  return useQuery({ queryKey: ["writing-exercise", id], queryFn: () => API(`/api/exercises/${id}`), enabled: !!id });
}

export function useMySubmission(exerciseId: string) {
  return useQuery({
    queryKey: ["exercise-my-submission", exerciseId],
    queryFn: () => API(`/api/exercises/${exerciseId}/my-submission`),
    enabled: !!exerciseId,
  });
}

export function useExerciseSubmissions(exerciseId: string) {
  return useQuery({
    queryKey: ["exercise-submissions", exerciseId],
    queryFn: () => API(`/api/exercises/${exerciseId}/submissions`),
    enabled: !!exerciseId,
  });
}

export function useCreateExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => POST("/api/exercises", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["writing-exercises"] }),
  });
}

export function useUpdateExercise(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => PATCH(`/api/exercises/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["writing-exercises"] });
      qc.invalidateQueries({ queryKey: ["writing-exercise", id] });
    },
  });
}

export function useDeleteExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => DELETE(`/api/exercises/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["writing-exercises"] }),
  });
}

export function useSubmitExercise(exerciseId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string; status?: string }) =>
      POST(`/api/exercises/${exerciseId}/submit`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["exercise-my-submission", exerciseId] });
      qc.invalidateQueries({ queryKey: ["exercise-submissions", exerciseId] });
    },
  });
}

export function useAddEditorNote(subId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (editorNote: string) =>
      PATCH(`/api/exercise-submissions/${subId}/note`, { editorNote }),
    onSuccess: (_data, _vars, ctx: any) => {
      qc.invalidateQueries({ queryKey: ["exercise-submissions"] });
    },
  });
}

export async function getAiNudge(exerciseId: string, draft: string): Promise<string> {
  const res = await POST(`/api/exercises/${exerciseId}/ai-nudge`, { draft });
  return res.nudge || "";
}
