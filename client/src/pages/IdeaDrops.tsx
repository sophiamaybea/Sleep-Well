import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function IdeaDrops() {
  const [content, setContent] = useState("");
  const queryClient = useQueryClient();

  const { data: drops = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/idea-drops"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/idea-drops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to create idea drop");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/idea-drops"] });
      setContent("");
    },
  });

  const adoptMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/idea-drops/${id}/adopt`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to adopt idea");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/idea-drops"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/idea-drops/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/idea-drops"] }),
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Idea Drops</h1>
      <p className="text-gray-600 mb-8">Drop a seed of an idea for others to adopt and grow.</p>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Drop a New Idea</h2>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share an idea seed..."
          className="w-full p-3 border rounded mb-3"
          rows={3}
        />
        <button
          onClick={() => createMutation.mutate()}
          disabled={!content.trim() || createMutation.isPending}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Drop Idea
        </button>
      </div>

      {isLoading && <p className="text-gray-400">Loading ideas...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drops.map((d: any) => (
          <div key={d.id} className="bg-white rounded-lg shadow p-4 border">
            <p className="text-gray-800 mb-2">{d.content}</p>
            <div className="flex justify-between items-center mt-3">
              <span className={`text-xs px-2 py-1 rounded ${d.status === "adopted" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {d.status}
              </span>
              <div className="flex gap-2">
                {d.status === "open" && (
                  <button
                    onClick={() => adoptMutation.mutate(d.id)}
                    className="text-indigo-600 text-sm hover:text-indigo-800"
                  >
                    Adopt
                  </button>
                )}
                <button
                  onClick={() => deleteMutation.mutate(d.id)}
                  className="text-red-500 text-sm hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
            <span className="text-xs text-gray-400 mt-2 block">
              {new Date(d.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
