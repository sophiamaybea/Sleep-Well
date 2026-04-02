import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function ReadingQueue() {
  const [writingId, setWritingId] = useState("");
  const queryClient = useQueryClient();

  const { data: queue = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/reading-queue"],
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/reading-queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingId }),
      });
      if (!res.ok) throw new Error("Failed to add to queue");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reading-queue"] });
      setWritingId("");
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/reading-queue/${id}/read`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to mark as read");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/reading-queue"] }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/reading-queue/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/reading-queue"] }),
  });

  const unread = queue.filter((q: any) => !q.isRead);
  const read = queue.filter((q: any) => q.isRead);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Reading Queue</h1>
      <p className="text-gray-600 mb-8">Save writings to read later.</p>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add to Queue</h2>
        <div className="flex gap-3">
          <input
            value={writingId}
            onChange={(e) => setWritingId(e.target.value)}
            placeholder="Writing ID"
            className="flex-1 p-3 border rounded"
          />
          <button
            onClick={() => addMutation.mutate()}
            disabled={!writingId.trim() || addMutation.isPending}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {isLoading && <p className="text-gray-400">Loading queue...</p>}

      {unread.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">To Read ({unread.length})</h2>
          <div className="space-y-3">
            {unread.map((q: any) => (
              <div key={q.id} className="bg-white rounded-lg shadow p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">Writing #{q.writingId?.slice(0, 8)}</p>
                  <span className="text-xs text-gray-400">{new Date(q.addedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => markReadMutation.mutate(q.id)} className="text-green-600 text-sm hover:text-green-800">Mark Read</button>
                  <button onClick={() => removeMutation.mutate(q.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-gray-500">Already Read ({read.length})</h2>
          <div className="space-y-3">
            {read.map((q: any) => (
              <div key={q.id} className="bg-gray-50 rounded-lg p-4 flex justify-between items-center opacity-60">
                <div>
                  <p className="font-medium line-through">Writing #{q.writingId?.slice(0, 8)}</p>
                  <span className="text-xs text-gray-400">{new Date(q.addedAt).toLocaleDateString()}</span>
                </div>
                <button onClick={() => removeMutation.mutate(q.id)} className="text-red-500 text-sm hover:text-red-700">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
