import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sprout, Leaf, Droplets, Users, Heart, TreePine, Plus } from "lucide-react";
import Navigation from "@/components/Navigation";
import { apiRequest } from "@/lib/queryClient";

export default function Grove() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-grove");
  const queryClient = useQueryClient();

  const { data: myPlants = [], isLoading } = useQuery({
    queryKey: ["/api/grove/plants"],
    enabled: !!user,
  });

  const { data: communityPlants = [] } = useQuery({
    queryKey: ["/api/grove/community"],
  });

  const plantMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("GET", "/api/grove/my-plant");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grove/plants"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grove/community"] });
    },
  });

  const waterMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/grove/water");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grove/plants"] });
    },
  });

  const tabs = [
    { id: "my-grove", label: "My Grove", icon: Sprout },
    { id: "community", label: "Community", icon: Users },
    { id: "watering", label: "Watering", icon: Droplets },
  ];

  return (
    <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", background: "linear-gradient(to bottom, #052e16, #14532d)", color: "#fff" }}>
      <Navigation />
      <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "2rem 1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "2rem" }}>
          <TreePine style={{ width: "2rem", height: "2rem", color: "#4ade80" }} />
          <div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "bold", color: "#86efac", margin: 0 }}>The Grove</h1>
            <p style={{ fontSize: "0.875rem", color: "#4ade80", margin: 0 }}>Your botanical social layer</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", background: "rgba(20,83,45,0.5)", borderRadius: "0.5rem", padding: "0.25rem" }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: "0.5rem 0.75rem",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  border: "none",
                  cursor: "pointer",
                  background: activeTab === tab.id ? "#16a34a" : "transparent",
                  color: activeTab === tab.id ? "#fff" : "#86efac",
                  transition: "all 0.2s",
                }}
              >
                <Icon style={{ width: "1rem", height: "1rem" }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "my-grove" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#86efac", margin: 0 }}>My Plants</h2>
              <button
                onClick={() => plantMutation.mutate()}
                disabled={plantMutation.isPending}
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "#16a34a", color: "#fff", padding: "0.5rem 1rem", borderRadius: "0.5rem", fontSize: "0.875rem", border: "none", cursor: "pointer", opacity: plantMutation.isPending ? 0.6 : 1 }}
              >
                <Plus style={{ width: "1rem", height: "1rem" }} />
                {plantMutation.isPending ? "Planting..." : "Plant Something"}
              </button>
            </div>
            {isLoading ? (
              <div style={{ color: "#4ade80", textAlign: "center", padding: "3rem 0" }}>Growing your grove...</div>
            ) : myPlants.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#4ade80" }}>
                <Sprout style={{ width: "4rem", height: "4rem", margin: "0 auto 1rem", opacity: 0.5, display: "block" }} />
                <p style={{ fontSize: "1.125rem", margin: 0 }}>Your grove is empty</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", opacity: 0.75 }}>Plant something to get started</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                {(myPlants as any[]).map((plant: any) => (
                  <div key={plant.id} style={{ background: "rgba(22,101,52,0.5)", borderRadius: "0.75rem", padding: "1rem", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Leaf style={{ width: "1.25rem", height: "1.25rem", color: "#4ade80" }} />
                      <span style={{ fontWeight: 500, color: "#fff" }}>{plant.plantType}</span>
                    </div>
                    <p style={{ color: "#86efac", fontSize: "0.875rem", margin: 0 }}>{plant.nickname || plant.plantType}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.75rem", fontSize: "0.75rem", color: "#4ade80" }}>
                      <Droplets style={{ width: "0.75rem", height: "0.75rem" }} />
                      <span>Streak: {plant.wateringStreak || 0} days</span>
                    </div>
                    <button
                      onClick={() => waterMutation.mutate()}
                      disabled={waterMutation.isPending}
                      style={{ marginTop: "0.75rem", width: "100%", padding: "0.4rem", background: "rgba(74,222,128,0.2)", border: "1px solid rgba(74,222,128,0.4)", borderRadius: "0.375rem", color: "#4ade80", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem" }}
                    >
                      <Droplets style={{ width: "0.875rem", height: "0.875rem" }} />
                      {waterMutation.isPending ? "Watering..." : "Water Plant"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "community" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#86efac", marginBottom: "1rem" }}>Community Grove</h2>
            {communityPlants.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem 0", color: "#4ade80" }}>
                <Users style={{ width: "4rem", height: "4rem", margin: "0 auto 1rem", opacity: 0.5, display: "block" }} />
                <p style={{ fontSize: "1.125rem", margin: 0 }}>No community plants yet</p>
                <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", opacity: 0.75 }}>Be the first to plant something</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
                {(communityPlants as any[]).map((plant: any) => (
                  <div key={plant.id} style={{ background: "rgba(22,101,52,0.5)", borderRadius: "0.75rem", padding: "1rem", border: "1px solid rgba(74,222,128,0.3)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                      <Leaf style={{ width: "1.25rem", height: "1.25rem", color: "#4ade80" }} />
                      <span style={{ fontWeight: 500, color: "#fff" }}>{plant.nickname || plant.plantType}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.75rem", color: "#4ade80" }}>
                      <Heart style={{ width: "0.75rem", height: "0.75rem" }} />
                      <span>{plant.totalWaterings || 0} waterings</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "watering" && (
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#86efac", marginBottom: "1rem" }}>Watering Log</h2>
            <div style={{ textAlign: "center", padding: "4rem 0", color: "#4ade80" }}>
              <Droplets style={{ width: "4rem", height: "4rem", margin: "0 auto 1rem", opacity: 0.5, display: "block" }} />
              <p style={{ fontSize: "1.125rem", margin: 0 }}>No watering history yet</p>
              <p style={{ fontSize: "0.875rem", marginTop: "0.5rem", opacity: 0.75 }}>Water your plants to start a streak</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
