import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  useAtelierSeriesList,
  useAtelierSeries,
  useAtelierRespond,
  useAtelierSaveToGarden,
} from "@/hooks/useAtelier";

const FREE_LIMIT = 2;

export default function Atelier() {
  const { user } = useAuth();
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const isCultivator =
    (user as any)?.tier === "cultivator" ||
    (user as any)?.role === "editor" ||
    (user as any)?.role === "admin";

  const { data: seriesList = [], isLoading } = useAtelierSeriesList();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground text-sm italic">Lighting the lamps…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-14">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
          The Page Gallery
        </p>
        <h1 className="font-serif text-4xl text-foreground mb-4">The Atelier</h1>
        <p className="text-muted-foreground text-sm max-w-prose leading-relaxed">
          A library of guided writing series. Each one moves through a technique, a form, or a
          question — and leads you somewhere you wouldn't have reached alone.
        </p>
        {!isCultivator && (
          <div className="mt-5 px-4 py-3 rounded border border-[var(--gold)]/30 bg-[var(--gold)]/5 text-sm text-muted-foreground">
            Free members may complete the first two exercises of any series.{" "}
            <a
              href="/cultivator"
              className="underline text-foreground hover:opacity-70 transition"
            >
              Become a Cultivator
            </a>{" "}
            to work through every exercise and save your writing to the Garden.
          </div>
        )}
      </header>

      {!activeSeries ? (
        <SeriesList
          series={seriesList}
          isCultivator={isCultivator}
          onOpen={setActiveSeries}
        />
      ) : (
        <SeriesDetail
          seriesId={activeSeries}
          isCultivator={isCultivator}
          onBack={() => setActiveSeries(null)}
        />
      )}
    </div>
  );
}

// — Series list —
function SeriesList({
  series,
  isCultivator,
  onOpen,
}: {
  series: any[];
  isCultivator: boolean;
  onOpen: (id: string) => void;
}) {
  if (series.length === 0) {
    return (
      <p className="text-muted-foreground italic text-sm">
        No series published yet. The first one is almost ready.
      </p>
    );
  }

  return (
    <div className="space-y-0">
      {series.map((s: any) => (
        <button
          key={s.id}
          onClick={() => onOpen(s.id)}
          className="w-full text-left group border-b border-border/40 py-6 hover:border-foreground/20 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                {s.genre !== "any" ? s.genre : ""}
                {s.theme ? ` · ${s.theme}` : ""}
              </p>
              <h2 className="font-serif text-xl text-foreground group-hover:opacity-70 transition">
                {s.title}
              </h2>
              {s.subtitle && (
                <p className="text-sm text-muted-foreground mt-0.5">{s.subtitle}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {s.totalExercises} exercise{s.totalExercises !== 1 ? "s" : ""} · led by{" "}
                {s.facilitator}
                {!isCultivator && s.totalExercises > FREE_LIMIT && (
                  <span className="ml-2 text-[var(--gold)]">first {FREE_LIMIT} free</span>
                )}
              </p>
            </div>
            <span className="text-muted-foreground text-xs mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform">
              →
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

// — Series detail —
function SeriesDetail({
  seriesId,
  isCultivator,
  onBack,
}: {
  seriesId: string;
  isCultivator: boolean;
  onBack: () => void;
}) {
  const { data, isLoading, error } = useAtelierSeries(seriesId);

  if (isLoading)
    return <p className="text-sm text-muted-foreground italic">Opening series…</p>;
  if (error || !data)
    return (
      <div>
        <BackLink onBack={onBack} />
        <p className="text-sm text-red-500">Could not load this series.</p>
      </div>
    );

  const { series, exercises, gated, total } = data as any;

  return (
    <div>
      <BackLink onBack={onBack} />
      <header className="mb-8">
        {series.theme && (
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            {series.theme}
          </p>
        )}
        <h2 className="font-serif text-3xl text-foreground mb-1">{series.title}</h2>
        {series.subtitle && (
          <p className="text-muted-foreground text-sm">{series.subtitle}</p>
        )}
        <p className="text-xs text-muted-foreground mt-2">Led by {series.facilitator}</p>
        {series.description && (
          <p className="text-sm text-muted-foreground mt-4 max-w-prose leading-relaxed">
            {series.description}
          </p>
        )}
      </header>

      <ExerciseList
        exercises={exercises}
        gated={gated}
        total={total}
        seriesId={seriesId}
        isCultivator={isCultivator}
      />
    </div>
  );
}

// — Exercise list —
function ExerciseList({
  exercises,
  gated,
  total,
  seriesId,
  isCultivator,
}: {
  exercises: any[];
  gated: boolean;
  total: number;
  seriesId: string;
  isCultivator: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {exercises.map((ex: any, i: number) => (
        <ExerciseCard
          key={ex.id}
          exercise={ex}
          index={i}
          isOpen={openId === ex.id}
          onToggle={() => setOpenId(openId === ex.id ? null : ex.id)}
          seriesId={seriesId}
          isCultivator={isCultivator}
        />
      ))}
      {gated && (
        <div className="border border-dashed border-[var(--gold)]/40 rounded-md p-8 text-center mt-6">
          <p className="text-sm text-muted-foreground mb-1">
            {total - exercises.length} more exercise
            {total - exercises.length !== 1 ? "s" : ""} in this series
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            Cultivator membership unlocks every exercise and saves your work to the Garden.
          </p>
          <a
            href="/cultivator"
            className="inline-block px-6 py-2 text-sm bg-foreground text-background rounded hover:opacity-80 transition"
          >
            Become a Cultivator
          </a>
        </div>
      )}
    </div>
  );
}

// — Exercise card —
function ExerciseCard({
  exercise,
  index,
  isOpen,
  onToggle,
  seriesId,
  isCultivator,
}: {
  exercise: any;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  seriesId: string;
  isCultivator: boolean;
}) {
  const [draft, setDraft] = useState<string>(exercise.myResponse?.content ?? "");
  const [saved, setSaved] = useState(false);
  const [gardenSaved, setGardenSaved] = useState(
    exercise.myResponse?.savedToGarden ?? false
  );

  const respondMutation = useAtelierRespond(seriesId);
  const gardenMutation = useAtelierSaveToGarden(seriesId);

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full text-left px-5 py-4 flex justify-between items-center hover:bg-muted/30 transition-colors"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Exercise {index + 1}
          </p>
          <h3 className="font-medium text-foreground mt-0.5">{exercise.title}</h3>
          {exercise.myResponse && !isOpen && (
            <p className="text-xs text-green-600 mt-0.5">Response saved ✓</p>
          )}
        </div>
        <span className="text-muted-foreground text-sm">{isOpen ? "↑" : "↓"}</span>
      </button>

      {isOpen && (
        <div className="px-5 pb-6 pt-1 border-t border-border/50">
          <p className="text-sm text-foreground leading-relaxed mb-4 max-w-prose">
            {exercise.prompt}
          </p>

          {exercise.craftNote && (
            <div className="mb-4 px-3 py-2 border-l-2 border-[var(--gold)]/40 bg-[var(--gold)]/5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                Craft note
              </p>
              <p className="text-xs text-muted-foreground">{exercise.craftNote}</p>
            </div>
          )}

          {exercise.exampleLine && (
            <p className="text-xs italic text-muted-foreground mb-4">
              e.g. "{exercise.exampleLine}"
            </p>
          )}

          <textarea
            className="w-full min-h-[180px] bg-background border border-border rounded p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--gold)] font-serif leading-relaxed"
            placeholder="Write here…"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setSaved(false);
            }}
          />

          <div className="flex flex-wrap gap-2 mt-2 items-center">
            <button
              onClick={() => {
                if (!draft.trim()) return;
                respondMutation.mutate(
                  { exerciseId: exercise.id, content: draft },
                  { onSuccess: () => setSaved(true) }
                );
              }}
              disabled={respondMutation.isPending || !draft.trim()}
              className="px-4 py-1.5 text-xs bg-foreground text-background rounded hover:opacity-80 transition disabled:opacity-40"
            >
              {respondMutation.isPending ? "Saving…" : "Save response"}
            </button>
            {saved && <span className="text-xs text-green-600">Saved ✓</span>}

            {isCultivator && exercise.myResponse && !gardenSaved && (
              <button
                onClick={() =>
                  gardenMutation.mutate(exercise.myResponse.id, {
                    onSuccess: () => setGardenSaved(true),
                  })
                }
                disabled={gardenMutation.isPending}
                className="px-4 py-1.5 text-xs border border-border rounded hover:bg-muted/40 transition disabled:opacity-40"
              >
                {gardenMutation.isPending ? "Planting…" : "Save to Garden"}
              </button>
            )}

            {gardenSaved && (
              <span className="text-xs text-muted-foreground">In your Garden ✓</span>
            )}
          </div>

          {respondMutation.error && (
            <p className="text-xs text-red-500 mt-2">
              {(respondMutation.error as any)?.message ?? "Something went wrong"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BackLink({ onBack }: { onBack: () => void }) {
  return (
    <button
      onClick={onBack}
      className="text-sm text-muted-foreground hover:text-foreground mb-8 flex items-center gap-1 transition"
    >
      ← All series
    </button>
  );
}
