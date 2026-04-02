import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const MOODS = ["sunny", "cloudy", "rainy", "stormy", "foggy", "breezy", "calm", "electric"];

export default function InnerWeather() {
  const [mood, setMood] = useState("");
  const [energy, setEnergy] = useState(5);
  const [note, setNote] = useState("");
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/weather"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/weather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, energy, note: note || undefined }),
      });
      if (!res.ok) throw new Error("Failed to log weather");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
      setMood("");
      setEnergy(5);
      setNote("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/weather/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/weather"] }),
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Inner Weather</h1>
      <p className="text-gray-600 mb-8">Track your creative mood and energy before writing.</p>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Log Today's Weather</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mood</label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`px-3 py-1 rounded-full text-sm border ${mood === m ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Energy: {energy}/10</label>
          <input
            type="range"
            min={1}
            max={10}
            value={energy}
            onChange={(e) => setEnergy(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note..."
          className="w-full p-3 border rounded mb-3"
          rows={2}
        />
        <button
          onClick={() => createMutation.mutate()}
          disabled={!mood || createMutation.isPending}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Log Weather
        </button>
      </div>

      {isLoading && <p className="text-gray-400">Loading entries...</p>}
      <div className="space-y-3">
        {entries.map((e: any) => (
          <div key={e.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
            <div>
              <span className="font-medium capitalize">{e.mood}</span>
              <span className="text-gray-500 ml-3">Energy: {e.energy}/10</span>
              {e.note && <p className="text-sm text-gray-500 mt-1">{e.note}</p>}
              <span className="text-xs text-gray-400 block mt-1">{new Date(e.createdAt).toLocaleDateString()}</span>
            </div>
            <button onClick={() => deleteMutation.mutate(e.id)} className="text-red-500 text-sm hover:text-red-700">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
