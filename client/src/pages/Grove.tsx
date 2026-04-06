import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { TreePine, Droplets, Users, Send, Check } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";

interface GrovePlant {
  id: string;
  userId: string;
  streakDays: number;
  lastWateredAt: string | null;
  updatedAt: string;
}

interface GroveConnection {
  id: string;
  displayName: string | null;
  profileImageUrl: string | null;
}

interface SeedPacket {
  id: string;
  token: string;
  usedAt: string | null;
  createdAt: string;
}

async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, { credentials: "include", ...init });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}

function PlantCard({ plant, onWater }: { plant: GrovePlant; onWater: () => void }) {
  const wateredToday =
    plant.lastWateredAt
      ? new Date(plant.lastWateredAt).toISOString().slice(0, 10) ===
        new Date().toISOString().slice(0, 10)
      : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 rounded border border-white/10 bg-white/[0.03]"
      data-testid="grove-plant-card"
    >
      <div className="flex items-center gap-3 mb-4">
        <TreePine size={20} className="text-[#4a7c59]" />
        <h2 className="font-serif text-lg text-white/90">Your Plant</h2>
      </div>
      <div className="flex items-center gap-6 mb-6">
        <div className="text-center">
          <p className="font-mono text-3xl text-[#4a7c59]">{plant.streakDays || 0}</p>
          <p className="text-[10px] tracking-widest uppercase text-white/40 mt-1">Day streak</p>
        </div>
        <div className="text-sm text-white/50 font-serif italic leading-relaxed">
          {plant.streakDays === 0
            ? "Your plant is waiting. Water it today to begin your streak."
            : plant.streakDays === 1
            ? "One day in. Come back tomorrow to keep it growing."
            : `${plant.streakDays} days of steady tending. Keep going.`}
        </div>
      </div>
      <button
        onClick={onWater}
        disabled={wateredToday}
        className="flex items-center gap-2 px-5 py-2.5 rounded border transition-colors text-sm font-mono tracking-wider uppercase disabled:opacity-40 disabled:cursor-not-allowed border-[#4a7c59]/50 text-[#4a7c59] hover:bg-[#4a7c59]/10"
        data-testid="button-water-plant"
      >
        {wateredToday ? (
          <>
            <Check size={14} /> Watered today
          </>
        ) : (
          <>
            <Droplets size={14} /> Water your plant
          </>
        )}
      </button>
    </motion.div>
  );
}

function ConnectionsPanel({ connections }: { connections: GroveConnection[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="p-6 rounded border border-white/10 bg-white/[0.03]"
      data-testid="grove-connections-panel"
    >
      <div className="flex items-center gap-3 mb-4">
        <Users size={20} className="text-[#6ba5a5]" />
        <h2 className="font-serif text-lg text-white/90">Tending Connections</h2>
      </div>
      {connections.length === 0 ? (
        <p className="text-sm text-white/40 font-serif italic">
          No connections yet. Send a tending request to a writer whose work you admire.
        </p>
      ) : (
        <ul className="space-y-3">
          {connections.map((c) => (
            <li key={c.id} className="flex items-center gap-3" data-testid={`connection-${c.id}`}>
              {c.profileImageUrl ? (
                <img
                  src={c.profileImageUrl}
                  alt={c.displayName || "Writer"}
                  className="w-8 h-8 rounded-full object-cover opacity-80"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <TreePine size={12} className="text-[#4a7c59]" />
                </div>
              )}
              <span className="font-serif text-sm text-white/70">
                {c.displayName || "Anonymous Writer"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

function SeedPacketsPanel({ packets }: { packets: SeedPacket[] }) {
  const qc = useQueryClient();
  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch("/api/grove/seed-packets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/grove/seed-packets"] });
      toast({ title: "Seed packet created", description: "Share the link with a friend." });
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="p-6 rounded border border-white/10 bg-white/[0.03]"
      data-testid="grove-seed-packets-panel"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Send size={18} className="text-[#c4a24d]" />
          <h2 className="font-serif text-lg text-white/90">Seed Packets</h2>
        </div>
        <button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending}
          className="text-xs font-mono tracking-widest uppercase px-3 py-1.5 rounded border border-[#c4a24d]/40 text-[#c4a24d] hover:bg-[#c4a24d]/10 transition-colors disabled:opacity-40"
          data-testid="button-create-seed-packet"
        >
          {createMutation.isPending ? "Creating…" : "+ New"}
        </button>
      </div>
      <p className="text-xs text-white/40 mb-4 leading-relaxed">
        Seed packets are referral links. Send one to a writer friend to invite them to the Garden.
      </p>
      {packets.length === 0 ? (
        <p className="text-sm text-white/40 font-serif italic">No seed packets yet.</p>
      ) : (
        <ul className="space-y-2">
          {packets.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between text-xs font-mono"
              data-testid={`seed-packet-${p.id}`}
            >
              <span className="text-white/50 truncate max-w-[200px]">
                {window.location.origin}/join?ref={p.token}
              </span>
              {p.usedAt ? (
                <span className="text-[#4a7c59] ml-2 shrink-0">Used</span>
              ) : (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/join?ref=${p.token}`
                    );
                    toast({ title: "Copied to clipboard" });
                  }}
                  className="ml-2 shrink-0 text-white/30 hover:text-white/60 transition-colors"
                  data-testid={`button-copy-seed-${p.id}`}
                >
                  Copy
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

export default function Grove() {
  const { user, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const { data: plant, isLoading: plantLoading } = useQuery<GrovePlant>({
    queryKey: ["/api/grove/my-plant"],
    queryFn: () => apiFetch("/api/grove/my-plant"),
    enabled: isAuthenticated,
  });

  const { data: connections = [] } = useQuery<GroveConnection[]>({
    queryKey: ["/api/grove/connections"],
    queryFn: () => apiFetch("/api/grove/connections"),
    enabled: isAuthenticated,
  });

  const { data: seedPackets = [] } = useQuery<SeedPacket[]>({
    queryKey: ["/api/grove/seed-packets"],
    queryFn: () => apiFetch("/api/grove/seed-packets"),
    enabled: isAuthenticated,
  });

  const waterMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/grove/water", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 409) {
        throw Object.assign(new Error("Already watered today"), { status: 409 });
      }
      if (!res.ok) {
        throw new Error("Failed to water plant");
      }
      return res.json();
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["/api/grove/my-plant"] });
      toast({
        title: "Plant watered",
        description: `Streak: ${data.streakDays} day${data.streakDays === 1 ? "" : "s"}`,
      });
    },
    onError: (err: any) => {
      if (err.status === 409) {
        toast({ title: "Already watered today", description: "Come back tomorrow." });
      } else {
        toast({ title: "Could not water plant", description: "Please try again." });
      }
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent text-foreground relative">
        <Navigation />
        <main className="relative z-10 py-32 px-6 text-center">
          <TreePine size={32} className="mx-auto mb-6 text-[#4a7c59] opacity-60" />
          <h1 className="font-display text-3xl italic mb-4">The Grove</h1>
          <p className="font-serif text-white/50 mb-8 max-w-sm mx-auto">
            Sign in to tend your plant, connect with other writers, and share seed packets.
          </p>
          <Link
            href="/sign-in"
            className="inline-block px-8 py-3 rounded bg-[#4a7c59] hover:bg-[#3d6a4b] text-white text-sm font-mono tracking-widest uppercase transition-colors"
            data-testid="button-sign-in-grove"
          >
            Sign In
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      <Navigation />

      <main id="main-content" className="relative z-10 py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mb-14"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#4a7c59]" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#4a7c59]">
                Social Garden
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-light tracking-normal italic mb-4">
              The Grove
            </h1>
            <p className="font-serif text-lg text-white/50 italic leading-relaxed">
              A quieter corner of the Garden. Tend your plant daily, connect with writers you
              admire, and share the space.
            </p>
          </motion.div>

          {plantLoading ? (
            <p className="text-sm text-white/40 italic">Loading your grove…</p>
          ) : (
            <div className="space-y-6">
              {plant && (
                <PlantCard plant={plant} onWater={() => waterMutation.mutate()} />
              )}
              <ConnectionsPanel connections={connections} />
              <SeedPacketsPanel packets={seedPackets} />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-10"
          >
            <Link
              href="/garden"
              className="text-xs font-mono tracking-widest uppercase text-white/30 hover:text-white/60 transition-colors"
              data-testid="link-back-garden"
            >
              ← Back to the Garden
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
