import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Sprout, Leaf, Droplets, Users, Heart, TreePine, Plus } from "lucide-react";

export default function Grove() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("my-grove");

  const { data: myPlants = [], isLoading } = useQuery({
    queryKey: ["/api/grove/plants"],
  });

  const { data: communityPlants = [] } = useQuery({
    queryKey: ["/api/grove/community"],
  });

  const tabs = [
    { id: "my-grove", label: "My Grove", icon: Sprout },
    { id: "community", label: "Community", icon: Users },
    { id: "watering", label: "Watering", icon: Droplets },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 to-green-900 text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <TreePine className="w-8 h-8 text-green-400" />
          <div>
            <h1 className="text-3xl font-bold text-green-300">The Grove</h1>
            <p className="text-green-400 text-sm">Your botanical social layer</p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-green-900/50 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={"flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2 " + (activeTab === tab.id ? "bg-green-600 text-white" : "text-green-300 hover:text-white")}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "my-grove" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-green-300">My Plants</h2>
              <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                <Plus className="w-4 h-4" />
                Plant Something
              </button>
            </div>
            {isLoading ? (
              <div className="text-green-400 text-center py-12">Growing your grove...</div>
            ) : myPlants.length === 0 ? (
              <div className="text-center py-16 text-green-400">
                <Sprout className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Your grove is empty</p>
                <p className="text-sm mt-2 opacity-75">Plant something to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(myPlants as any[]).map((plant: any) => (
                  <div key={plant.id} className="bg-green-800/50 rounded-xl p-4 border border-green-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-5 h-5 text-green-400" />
                      <span className="font-medium">{plant.plantType}</span>
                    </div>
                    <p className="text-green-300 text-sm">{plant.nickname || plant.plantType}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs text-green-400">
                      <Droplets className="w-3 h-3" />
                      <span>Streak: {plant.wateringStreak || 0} days</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "community" && (
          <div>
            <h2 className="text-xl font-semibold text-green-300 mb-4">Community Grove</h2>
            {communityPlants.length === 0 ? (
              <div className="text-center py-16 text-green-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No community plants yet</p>
                <p className="text-sm mt-2 opacity-75">Be the first to plant something</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(communityPlants as any[]).map((plant: any) => (
                  <div key={plant.id} className="bg-green-800/50 rounded-xl p-4 border border-green-700/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Leaf className="w-5 h-5 text-green-400" />
                      <span className="font-medium">{plant.nickname || plant.plantType}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                      <Heart className="w-3 h-3" />
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
            <h2 className="text-xl font-semibold text-green-300 mb-4">Watering Log</h2>
            <div className="text-center py-16 text-green-400">
              <Droplets className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No watering history yet</p>
              <p className="text-sm mt-2 opacity-75">Water your plants to start a streak</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
