import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface MarginaliaNote {
  id: string;
  writingId: string;
  content: string;
  highlight: string;
  color: string;
  position: number;
  createdAt: string;
}

interface MarginaliaPanelProps {
  writingId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MarginaliaPanel({ writingId, isOpen, onClose }: MarginaliaPanelProps) {
  const [newNote, setNewNote] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const queryClient = useQueryClient();

  const { data: notes = [], isLoading } = useQuery<MarginaliaNote[]>({
    queryKey: ["/api/marginalia/writing", writingId],
    enabled: isOpen && !!writingId,
  });

  const createMutation = useMutation({
    mutationFn: async (data: { content: string; color: string }) => {
      const res = await fetch("/api/marginalia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writingId, ...data }),
      });
      if (!res.ok) throw new Error("Failed to create note");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marginalia/writing", writingId] });
      setNewNote("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/marginalia/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/marginalia/writing", writingId] }),
  });

  const colors = ["yellow", "pink", "blue", "green", "purple"];

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg border-l z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold text-lg">Marginalia</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {isLoading && <p className="text-gray-400">Loading notes...</p>}
        {notes.map((note) => (
          <div key={note.id} className={`p-3 rounded-lg border-l-4`} style={{ borderColor: note.color }}>
            <p className="text-sm">{note.content}</p>
            {note.highlight && <p className="text-xs text-gray-400 mt-1 italic">{note.highlight}</p>}
            <button
              onClick={() => deleteMutation.mutate(note.id)}
              className="text-xs text-red-400 hover:text-red-600 mt-1"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="p-4 border-t">
        <div className="flex gap-1 mb-2">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              className={`w-6 h-6 rounded-full border-2 ${selectedColor === c ? "border-gray-800" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a margin note..."
          className="w-full p-2 border rounded text-sm resize-none"
          rows={3}
        />
        <button
          onClick={() => createMutation.mutate({ content: newNote, color: selectedColor })}
          disabled={!newNote.trim() || createMutation.isPending}
          className="mt-2 w-full bg-indigo-600 text-white py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          Add Note
        </button>
      </div>
    </div>
  );
}
