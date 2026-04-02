import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function BouquetBuilder() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const { data: bouquets = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/bouquets"],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/bouquets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, writingIds: [], tags: [] }),
      });
      if (!res.ok) throw new Error("Failed to create bouquet");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bouquets"] });
      setTitle("");
      setDescription("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/bouquets/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/bouquets"] }),
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Bouquet Builder</h1>
      <p className="text-gray-600 mb-8">Curate collections of writings into thematic bouquets.</p>
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Bouquet</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bouquet title"
          className="w-full p-3 border rounded mb-3"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-3 border rounded mb-3"
          rows={3}
        />
        <button
          onClick={() => createMutation.mutate()}
          disabled={!title.trim() || createMutation.isPending}
          className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          Create Bouquet
        </button>
      </div>
      {isLoading && <p className="text-gray-400">Loading bouquets...</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bouquets.map((b: any) => (
          <div key={b.id} className="bg-white rounded-lg shadow p-4 border">
            <h3 className="font-semibold text-lg">{b.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{b.description}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-gray-400">
                {new Date(b.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => deleteMutation.mutate(b.id)}
                className="text-red-500 text-sm hover:text-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
