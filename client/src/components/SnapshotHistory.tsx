import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Snapshot {
  id: string;
  writingId: string;
  content: string;
  versionLabel: string;
  createdAt: string;
}

interface SnapshotHistoryProps {
  writingId: string;
  onRestore?: (content: string) => void;
}

export default function SnapshotHistory({ writingId, onRestore }: SnapshotHistoryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: snapshots = [], isLoading } = useQuery<Snapshot[]>({
    queryKey: ["/api/snapshots"],
  });

  const filtered = snapshots.filter((s) => s.writingId === writingId);

  const createMutation = useMutation({
    mutationFn: async (data: { writingId: string; content: string; versionLabel: string }) => {
      const res = await fetch("/api/snapshots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create snapshot");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/snapshots"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/snapshots/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/snapshots"] }),
  });

  const selected = filtered.find((s) => s.id === selectedId);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-lg mb-3">Version History</h3>
      {isLoading && <p className="text-gray-400">Loading...</p>}
      {filtered.length === 0 && !isLoading && (
        <p className="text-gray-400 text-sm">No snapshots yet</p>
      )}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filtered.map((snap) => (
          <div
            key={snap.id}
            onClick={() => setSelectedId(snap.id)}
            className={`p-2 rounded border cursor-pointer text-sm ${selectedId === snap.id ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:bg-gray-50"}`}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{snap.versionLabel}</span>
              <span className="text-xs text-gray-400">
                {new Date(snap.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="mt-3 flex gap-2">
          {onRestore && (
            <button
              onClick={() => onRestore(selected.content)}
              className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
            >
              Restore
            </button>
          )}
          <button
            onClick={() => deleteMutation.mutate(selected.id)}
            className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
