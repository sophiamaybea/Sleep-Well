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
    // server route: GET /api/marketplace/services/my
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
    // server route: POST /api/marketplace/bookings/create-checkout
    mutationFn: (body: { serviceId: string; note?: string }) =>
      POST("/api/marketplace/bookings/create-checkout", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-my-bookings"] });
    },
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["marketplace-my-bookings"],
    // server route: GET /api/marketplace/bookings
    queryFn: () => API("/api/marketplace/bookings"),
  });
}

// ─── Tip Jar ──────────────────────────────────────────────────────────────────

export function useMyTipJar() {
  // Fetch the current user's tip jar via their authorId
  // The server exposes GET /api/marketplace/tip-jar/:authorId (public)
  // and POST /api/marketplace/tip-jar (upsert, auth required)
  // We fetch the upsert endpoint response via the POST, or use the user's id via auth
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
    // server route: POST /api/marketplace/tip-jar
    mutationFn: (body: unknown) => POST("/api/marketplace/tip-jar", body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["marketplace-my-tip-jar"] });
    },
  });
}

export function useSendTip() {
  const qc = useQueryClient();
  return useMutation({
    // server route: POST /api/marketplace/tip
    mutationFn: (body: { authorId: string; amountPence: number }) =>
      POST("/api/marketplace/tip", body),
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
