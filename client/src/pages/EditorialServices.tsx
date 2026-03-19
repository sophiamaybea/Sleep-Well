import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function EditorialServices() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    genre: "poetry",
    manuscriptType: "poetry_collection",
    estimatedWordCount: "",
    brief: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) =>
      apiRequest("POST", "/api/editorial-waitlist", {
        ...data,
        estimatedWordCount: data.estimatedWordCount
          ? parseInt(data.estimatedWordCount)
          : null,
      }),
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#0a0908] text-[#e8e0d4] flex items-center justify-center px-6">
        <div className="max-w-xl text-center space-y-6">
          <h2 className="text-2xl font-serif">You're on the waitlist.</h2>
          <p className="text-[#b8b0a4] leading-relaxed">
            Sophia will read your details and be in touch. If your project is
            selected, you'll receive a payment link and a timeline.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0908] text-[#e8e0d4]">
      <div className="max-w-2xl mx-auto px-6 py-24 space-y-16">
        <header className="space-y-6">
          <h1 className="text-4xl font-serif tracking-tight">
            Editorial Services
          </h1>
          <p className="text-lg text-[#b8b0a4] leading-relaxed">
            A forensic manuscript reading by Sophia. 60\u201370 pages of notes.
            Sentence-level attention to voice, structure, pattern, and
            consciousness.
          </p>
        </header>

        <section className="space-y-4 text-[#b8b0a4] leading-relaxed text-sm">
          <p>
            Novel. Story collection. Poetry manuscript. Essay collection. Memoir.
            Hybrid work. Form is not the variable. The question is always: what
            is this piece of writing actually doing at the level of the
            language, and where does it stop doing it.
          </p>
          <p>
            Prices vary by project scope and length. If you cannot afford the
            full fee, rates can be tailored to your circumstances.
          </p>
        </section>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(form);
          }}
          className="space-y-8 border-t border-[#2a2520] pt-12"
        >
          <h2 className="text-xl font-serif">Join the waitlist</h2>

          <div className="grid gap-6">
            <div>
              <label className="block text-sm text-[#8a8078] mb-2">Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-transparent border border-[#2a2520] rounded px-4 py-3 text-[#e8e0d4] focus:border-[#6b5e4f] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8078] mb-2">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-transparent border border-[#2a2520] rounded px-4 py-3 text-[#e8e0d4] focus:border-[#6b5e4f] focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[#8a8078] mb-2">Genre</label>
                <select
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="w-full bg-[#0a0908] border border-[#2a2520] rounded px-4 py-3 text-[#e8e0d4] focus:border-[#6b5e4f] focus:outline-none"
                >
                  <option value="poetry">Poetry</option>
                  <option value="fiction">Fiction</option>
                  <option value="nonfiction">Nonfiction / Essay</option>
                  <option value="memoir">Memoir</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#8a8078] mb-2">Manuscript type</label>
                <select
                  value={form.manuscriptType}
                  onChange={(e) => setForm({ ...form, manuscriptType: e.target.value })}
                  className="w-full bg-[#0a0908] border border-[#2a2520] rounded px-4 py-3 text-[#e8e0d4] focus:border-[#6b5e4f] focus:outline-none"
                >
                  <option value="poetry_collection">Poetry collection</option>
                  <option value="novel">Novel</option>
                  <option value="story_collection">Story collection</option>
                  <option value="essay_collection">Essay collection</option>
                  <option value="memoir">Memoir</option>
                  <option value="hybrid">Hybrid work</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#8a8078] mb-2">
                Estimated word count (optional)
              </label>
              <input
                type="number"
                value={form.estimatedWordCount}
                onChange={(e) => setForm({ ...form, estimatedWordCount: e.target.value })}
                className="w-full bg-transparent border border-[#2a2520] rounded px-4 py-3 text-[#e8e0d4] focus:border-[#6b5e4f] focus:outline-none"
                placeholder="e.g. 45000"
              />
            </div>
            <div>
              <label className="block text-sm text-[#8a8078] mb-2">
                Brief description of your manuscript
              </label>
              <textarea
                value={form.brief}
                onChange={(e) => setForm({ ...form, brief: e.target.value })}
                rows={4}
                className="w-full bg-transparent border border-[#2a2520] rounded px-4 py-3 text-[#e8e0d4] focus:border-[#6b5e4f] focus:outline-none resize-none"
                placeholder="What is the work? Where is it in its life?"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-[#2a2520] hover:bg-[#3a3530] text-[#e8e0d4] py-4 rounded font-serif tracking-wide transition-colors disabled:opacity-50"
          >
            {mutation.isPending ? "Submitting..." : "Join waitlist"}
          </button>

          {mutation.isError && (
            <p className="text-red-400 text-sm">
              {(mutation.error as any)?.message?.includes("duplicate")
                ? "This email is already on the waitlist."
                : "Something went wrong. Please try again."}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
