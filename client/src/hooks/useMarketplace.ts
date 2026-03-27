import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
    queryFn: () => API("/api/marketplace/services/mine"),
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
      POST("/api/marketplace/bookings", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-my-bookings"] });
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["marketplace-my-bookings"],
    queryFn: () => API("/api/marketplace/bookings/mine"),
  });
}

export function useServiceOrders() {
  return useQuery({
    queryKey: ["marketplace-service-orders"],
    queryFn: () => API("/api/marketplace/bookings/orders"),
  });
}

// ─── Tip Jar ──────────────────────────────────────────────────────────────────

export function useMyTipJar() {
  return useQuery({
    queryKey: ["marketplace-my-tip-jar"],
    queryFn: () => API("/api/marketplace/tip-jar/mine"),
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { tipJarId: string; amountPence: number }) =>
      POST("/api/marketplace/tip-jar/tip", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-my-tip-jar"] });
    },
  });
}

// ─── Stripe Connect Onboarding ────────────────────────────────────────────────

export function useStripeConnectOnboard() {
  return useMutation({
    mutationFn: () => POST("/api/marketplace/connect/onboard", {}),
  });
}

export function useStripeConnectStatus() {
  return useQuery({
    queryKey: ["marketplace-connect-status"],
    queryFn: () => API("/api/marketplace/connect/status"),
  });
}
