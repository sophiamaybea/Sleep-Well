import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

const API = (path: string) => fetch(path, { credentials: "include" }).then(r => r.json());
const POST = (path: string, body: unknown) =>
  fetch(path, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
const PATCH = (path: string, body: unknown) =>
  fetch(path, { method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json());
const DELETE = (path: string) =>
  fetch(path, { method: "DELETE", credentials: "include" }).then(r => r.json());

// ─── Writer Services ──────────────────────────────────────────────────────────
export function useMarketplaceServices() {
  return useQuery({
    queryKey: ["marketplace-services"],
    queryFn: () => API("/api/marketplace/services"),
  });
}

export function useMyServices() {
  return useQuery({
    queryKey: ["marketplace-my-services"],
    queryFn: () => API("/api/marketplace/services/my"),
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => POST("/api/marketplace/services", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-services"] });
      qc.invalidateQueries({ queryKey: ["marketplace-my-services"] });
    },
  });
}

export function useUpdateService(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => PATCH(`/api/marketplace/services/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-services"] });
      qc.invalidateQueries({ queryKey: ["marketplace-my-services"] });
    },
  });
}

export function useDeleteService(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => DELETE(`/api/marketplace/services/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-services"] });
      qc.invalidateQueries({ queryKey: ["marketplace-my-services"] });
    },
  });
}

// ─── Service Bookings ─────────────────────────────────────────────────────────
export function useBookService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { serviceId: string; note?: string }) =>
      POST(`/api/marketplace/services/${body.serviceId}/book`, body),
  });
}

export function useCaptureBooking(bookingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => POST(`/api/marketplace/services/bookings/${bookingId}/capture`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-my-bookings"] });
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["marketplace-my-bookings"],
    queryFn: () => API("/api/marketplace/bookings"),
  });
}

// ─── Tip Jar ──────────────────────────────────────────────────────────────────
export function useMyTipJar() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["marketplace-my-tip-jar", user?.id],
    queryFn: () => API(`/api/marketplace/tip-jar/${user!.id}`),
    enabled: !!user?.id,
  });
}

export function useTipJar(authorId: string) {
  return useQuery({
    queryKey: ["marketplace-tip-jar", authorId],
    queryFn: () => API(`/api/marketplace/tip-jar/${authorId}`),
    enabled: !!authorId,
  });
}

export function useUpsertTipJar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: unknown) => POST("/api/marketplace/tip-jar", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-my-tip-jar"] });
    },
  });
}

export function useSendTip() {
  return useMutation({
    mutationFn: (body: { authorId: string; amountPence: number }) =>
      POST(`/api/marketplace/tip`, body),
  });
}

export function useCaptureTip(txId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => POST(`/api/marketplace/tips/transactions/${txId}/capture`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-my-tip-jar"] });
    },
  });
}
