import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import {
  useExercises,
  useCreateExercise,
  useUpdateExercise,
  useDeleteExercise,
  useExerciseSubmissions,
  useAddEditorNote,
} from "@/hooks/use-writing-exercises";

export default function ExerciseAdmin() {
  const { user } = useAuth();
    if (!user || ((user as any).role !== "editor" && (user as any).role !== "editor_in_chief")) return <Redirect to="/" />;
  return <ExerciseAdminInner />;
}

function ExerciseAdminInner() {
  const { data: exercises = [], isLoading } = useExercises();
  const createExercise = useCreateExercise();
  const deleteExercise = useDeleteExercise();
  const [creating, setCreating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", prompt: "", guidanceNote: "", genre: "any", wordLimit: "", closesAt: "" });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    await createExercise.mutateAsync({
      ...form,
      wordLimit: form.wordLimit ? parseInt(form.wordLimit) : undefined,
      closesAt: form.closesAt || undefined,
    });
    setForm({ title: "", prompt: "", guidanceNote: "", genre: "any", wordLimit: "", closesAt: "" });
    setCreating(false);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#060d06", color: "#e8e0d0" }}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10">
          <p className="font-mono text-[9px] tracking-[0.35em] uppercase text-amber-400/60 mb-2">Editor Studio</p>
          <h1 className="font-serif text-3xl text-amber-100">Writing Exercises</h1>
          <p className="mt-2 text-sm text-white/40">Post exercises for your writers. Each opens a focused AI-adaptive studio.</p>
        </div>
        <button onClick={() => setCreating(v => !v)} className="mb-8 px-5 py-2 text-xs tracking-widest uppercase font-mono border border-amber-400/30 text-amber-300/80 hover:border-amber-400/60 hover:text-amber-300 transition-colors">
          {creating ? "Cancel" : "+ New Exercise"}
        </button>
        {creating && (
          <form onSubmit={handleCreate} className="mb-10 p-6 border border-white/10 space-y-4">
            <div>
              <label className="block text-xs font-mono tracking-widest uppercase text-white/50 mb-1">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="w-full bg-transparent border-b border-white/20 focus:border-amber-400/60 outline-none py-2 text-white/90 text-sm" placeholder="e.g. The Body in Summer" />
            </div>
            <div>
              <label className="block text-xs font-mono tracking-widest uppercase text-white/50 mb-1">Prompt *</label>
              <textarea value={form.prompt} onChange={e => setForm(f => ({ ...f, prompt: e.target.value }))} required rows={4} className="w-full bg-transparent border border-white/20 focus:border-amber-400/60 outline-none p-3 text-white/90 text-sm resize-none" placeholder="Write the full exercise prompt here..." />
            </div>
            <div>
              <label className="block text-xs font-mono tracking-widest uppercase text-white/50 mb-1">Guidance Note</label>
              <input value={form.guidanceNote} onChange={e => setForm(f => ({ ...f, guidanceNote: e.target.value }))} className="w-full bg-transparent border-b border-white/20 focus:border-amber-400/60 outline-none py-2 text-white/90 text-sm" placeholder="e.g. Focus on the senses, avoid metaphor" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase text-white/50 mb-1">Genre</label>
                <select value={form.genre} onChange={e => setForm(f => ({ ...f, genre: e.target.value }))} className="w-full bg-[#0c1a0c] border border-white/20 text-white/80 text-sm py-2 px-2">
                  {["any","poetry","prose","flash","essay","hybrid"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase text-white/50 mb-1">Word Limit</label>
                <input type="number" value={form.wordLimit} onChange={e => setForm(f => ({ ...f, wordLimit: e.target.value }))} className="w-full bg-transparent border-b border-white/20 outline-none py-2 text-white/90 text-sm" placeholder="e.g. 300" />
              </div>
              <div>
                <label className="block text-xs font-mono tracking-widest uppercase text-white/50 mb-1">Closes At</label>
                <input type="datetime-local" value={form.closesAt} onChange={e => setForm(f => ({ ...f, closesAt: e.target.value }))} className="w-full bg-transparent border-b border-white/20 outline-none py-2 text-white/90 text-sm" />
              </div>
            </div>
            <button type="submit" disabled={createExercise.isPending} className="px-6 py-2 text-xs font-mono tracking-widest uppercase bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30 transition-colors disabled:opacity-50">
              {createExercise.isPending ? "Posting..." : "Post Exercise"}
            </button>
          </form>
        )}
        {isLoading ? <p className="text-white/30 text-sm font-mono">Loading...</p>
          : exercises.length === 0 ? <p className="text-white/30 text-sm">No exercises yet.</p>
          : (
            <div className="space-y-4">
              {(exercises as any[]).map((ex) => (
                <ExerciseRow key={ex.id} exercise={ex} isSelected={selectedId === ex.id}
                  onSelect={() => setSelectedId(selectedId === ex.id ? null : ex.id)}
                  onDelete={() => deleteExercise.mutate(ex.id)}
                />
              ))}
            </div>
          )
        }
      </div>
    </div>
  );
}

function ExerciseRow({ exercise: ex, isSelected, onSelect, onDelete }: any) {
  const updateExercise = useUpdateExercise(ex.id);
  const { data: submissions = [] } = useExerciseSubmissions(isSelected ? ex.id : "");
  const [notingId, setNotingId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");
  const addNote = useAddEditorNote(notingId || "");

  return (
    <div className="border border-white/10 hover:border-white/20 transition-colors">
      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className={`inline-block w-2 h-2 rounded-full ${ex.is_active ? "bg-green-400" : "bg-white/20"}`} />
            <h3 className="font-serif text-lg text-amber-100 truncate">{ex.title}</h3>
            <span className="text-xs font-mono text-white/30">{ex.genre}</span>
          </div>
          <p className="text-sm text-white/50 line-clamp-2">{ex.prompt}</p>
          {ex.guidance_note && <p className="mt-1 text-xs text-amber-400/50 italic">{ex.guidance_note}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => updateExercise.mutate({ isActive: !ex.is_active })} className="px-3 py-1 text-xs font-mono border border-white/20 text-white/50 hover:text-white/80 transition-colors">
            {ex.is_active ? "Deactivate" : "Activate"}
          </button>
          <button onClick={onSelect} className="px-3 py-1 text-xs font-mono border border-amber-400/30 text-amber-300/60 hover:text-amber-300 transition-colors">
            {isSelected ? "Hide" : "Submissions"}
          </button>
          <button onClick={onDelete} className="px-3 py-1 text-xs font-mono border border-red-400/20 text-red-400/50 hover:text-red-400 transition-colors">Delete</button>
        </div>
      </div>
      {isSelected && (
        <div className="border-t border-white/10 p-5">
          <p className="text-xs font-mono tracking-widest uppercase text-white/30 mb-4">{(submissions as any[]).length} Submission{(submissions as any[]).length !== 1 ? "s" : ""}</p>
          {(submissions as any[]).length === 0 ? <p className="text-white/25 text-sm">No submissions yet.</p> : (
            <div className="space-y-4">
              {(submissions as any[]).map((sub) => (
                <div key={sub.id} className="p-4 border border-white/8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-amber-300/60">{sub.author_name}</span>
                    <span className={`text-xs font-mono ${sub.status === "noted" ? "text-green-400/60" : "text-white/25"}`}>{sub.status}</span>
                  </div>
                  <p className="text-sm text-white/70 whitespace-pre-wrap leading-relaxed">{sub.content}</p>
                  {sub.editor_note && <p className="mt-2 text-xs text-amber-400/60 italic border-l-2 border-amber-400/20 pl-3">{sub.editor_note}</p>}
                  {notingId === sub.id ? (
                    <div className="mt-3 flex gap-2">
                      <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={2} className="flex-1 bg-transparent border border-white/20 text-white/80 text-xs p-2 resize-none" placeholder="Leave a note..." />
                      <div className="flex flex-col gap-1">
                        <button onClick={async () => { await addNote.mutateAsync(noteText); setNotingId(null); setNoteText(""); }} className="px-3 py-1 text-xs font-mono bg-amber-600/20 border border-amber-500/40 text-amber-300">Save</button>
                        <button onClick={() => setNotingId(null)} className="px-3 py-1 text-xs font-mono border border-white/20 text-white/40">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setNotingId(sub.id); setNoteText(sub.editor_note || ""); }} className="mt-2 text-xs font-mono text-amber-400/40 hover:text-amber-400/70">
                      {sub.editor_note ? "Edit note" : "+ Add note"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
