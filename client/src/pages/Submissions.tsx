import { useEffect, useRef } from "react";
import { Link } from "wouter";
import "./Submissions.css";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      el.querySelectorAll<HTMLElement>(".reveal").forEach(child => {
        child.style.opacity = "1";
        child.style.transform = "none";
      });
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const children = Array.from(entry.target.querySelectorAll<HTMLElement>(".reveal"));
            children.forEach((child, i) => {
              setTimeout(() => {
                child.style.opacity = "1";
                child.style.transform = "translateY(0)";
              }, i * 80);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function Room({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useReveal();
  return (
    <section
      ref={ref}
      className={`submissions-room ${className}`}
    >
      {children}
    </section>
  );
}

export default function Submissions() {
  return (
    <main className="submissions-page">

      {/* Room 1 — The interrupt */}
      <Room className="room-interrupt">
        <p className="reveal interrupt-label">Submissions</p>
        <h1 className="reveal interrupt-heading">
          We don&apos;t have<br />a submissions portal.
        </h1>
        <p className="reveal interrupt-subline">
          What we have is something else entirely.
        </p>
      </Room>

      {/* Room 2 — The Gallery reframe */}
      <Room className="room-reframe">
        <div className="room-inner">
          <h2 className="reveal section-heading">The Gallery does not receive parcels.</h2>
          <p className="reveal section-body">
            The Page Gallery is a literary journal and illustrated art gallery. It publishes finished work &mdash;
            poetry, prose, essays, visual art &mdash; that has survived long enough to stand in clean light.
          </p>
          <p className="reveal section-body">
            There are no themes. No formulas. No rejection letters.
            The Gallery exhibits what has grown. It does not process applications.
          </p>
          <p className="reveal section-body section-body--accent">
            If it matters to the writer, it matters.
          </p>
        </div>
      </Room>

      {/* Room 3 — The Garden introduced */}
      <Room className="room-garden-intro">
        <div className="room-inner">
          <p className="reveal section-eyebrow">So where do you begin?</p>
          <h2 className="reveal section-heading">In The Garden.</h2>
          <p className="reveal section-body">
            The Garden is where writers live &mdash; not a form you fill in, but a space you tend.
            It is the writing environment, the community, and the submission platform,
            all inside one continuous architecture.
          </p>
          <p className="reveal section-body">
            You write there. You keep notes there. You let fragments sit for six months without
            anyone penalising you for it. And when submissions open, you offer work directly
            from inside your own garden.
          </p>
          <p className="reveal section-body">
            The editorial team reads from within theirs.
          </p>
        </div>
      </Room>

      {/* Room 4 — Seed, Sprout, Bloom */}
      <Room className="room-stages">
        <div className="room-inner">
          <p className="reveal section-eyebrow">How pieces live in The Garden</p>
          <h2 className="reveal section-heading">Everything begins as a Seed.</h2>
          <p className="reveal section-body">
            In The Garden, pieces exist in three states &mdash; not because you must progress through
            them, but because most writing is not finished: it is interrupted.
          </p>
          <div className="stages-grid">
            <div className="reveal stage-card">
              <span className="stage-name">Seed</span>
              <p className="stage-description">
                A fragment. A first line. An obsessive question that hasn&apos;t
                declared its form yet. It can stay here as long as it needs to.
              </p>
            </div>
            <div className="reveal stage-card">
              <span className="stage-name">Sprout</span>
              <p className="stage-description">
                It&apos;s becoming something. The shape is visible.
                You might share it with a trusted few. You might keep it entirely private.
              </p>
            </div>
            <div className="reveal stage-card">
              <span className="stage-name">Bloom</span>
              <p className="stage-description">
                It&apos;s ready to stand in light. This is the state from which
                you can offer work to the Gallery &mdash; when you decide it is, not when a portal closes.
              </p>
            </div>
          </div>
          <p className="reveal section-body section-body--note">
            These are not progress indicators. They are not gamified. The only person who decides
            a piece&apos;s state is its maker.
          </p>
        </div>
      </Room>

      {/* Room 5 — The architecture */}
      <Room className="room-architecture">
        <div className="room-inner room-inner--dark">
          <h2 className="reveal section-heading section-heading--light">One continuous space.</h2>
          <p className="reveal section-body section-body--light">
            The architecture that holds your private seeds is the same architecture that manages
            submissions into issues. There is no separate portal bolted on.
          </p>
          <p className="reveal section-body section-body--light">
            When a submission window opens, it opens quietly, inside The Garden.
            You see it. You decide whether to offer something. There is no scramble,
            no submission manager, no cover letter, no reading fee.
          </p>
          <p className="reveal section-body section-body--light">
            The Gallery grows from The Garden. They are one place.
          </p>
        </div>
      </Room>

      {/* Room 6 — What the Gallery looks for */}
      <Room className="room-looking-for">
        <div className="room-inner">
          <p className="reveal section-eyebrow">What we exhibit</p>
          <h2 className="reveal section-heading">Work that is alive for its maker.</h2>
          <p className="reveal section-body">
            The Gallery has no themes, no quotas, no preferred forms.
            It does not look for what is trending, or what fits the current moment,
            or what reads as commercial.
          </p>
          <p className="reveal section-body">
            It looks for writing and art where something was genuinely at stake for the
            person who made it. Where the work is alive, not performed. Where the piece
            needed to exist.
          </p>
          <p className="reveal section-body section-body--accent">
            We publish poetry, prose, hybrid work, essays, and visual art.
            All genres. All lengths. All voices.
          </p>
        </div>
      </Room>

      {/* Room 7 — The invitation */}
      <Room className="room-invitation">
        <div className="room-inner room-inner--invitation">
          <h2 className="reveal invitation-heading">The door is The Garden.</h2>
          <p className="reveal invitation-body">
            Join The Garden. Write there. Let things sit. Watch what grows.
            When submissions open, you&apos;ll know &mdash; and you&apos;ll already be home.
          </p>
          <div className="reveal invitation-ctas">
            <Link href="/garden" className="cta-primary">
              Enter The Garden
            </Link>
            <Link href="/about" className="cta-secondary">
              Read about the Gallery
            </Link>
          </div>
          <p className="reveal invitation-note">
            The Garden is free. It will always be free.
          </p>
        </div>
      </Room>

    </main>
  );
}
