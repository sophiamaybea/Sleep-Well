import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap-init";

const SERVICES = [
  {
    id: "analysis",
    label: "60-page analysis",
    title: "60-Page Analysis",
    description:
      "A deep, considered read of your work spanning up to 60 pages. We tell you honestly what may not be landing with certain publications — and why — so you can bring more intention to each submission. Send as much work as you want.",
  },
  {
    id: "feedback",
    label: "Feedback on individual work",
    title: "Piece-by-Piece Feedback",
    description:
      "Detailed, line-level notes on a single piece. We look at structure, voice, rhythm, and where the writing opens or closes. A conversation between the work and the reader it’s reaching for.",
  },
  {
    id: "mentorship",
    label: "Ongoing mentorship",
    title: "Ongoing Mentorship",
    description:
      "A sustained relationship with your writing practice. We meet your work where it is and help you grow — through drafts, directions, and the quiet work of finding your literary home.",
  },
];

export default function ServicesWeProvide() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const [selectedService, setSelectedService] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      // Heading slide-in
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: headingRef.current,
            start: "top 85%",
            once: true,
          },
        }
      );

      // Service cards staggered reveal
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(
          el,
          { opacity: 0, x: i % 2 === 0 ? -40 : 40, y: 20 },
          {
            opacity: 1,
            x: 0,
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            delay: i * 0.12,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          }
        );
      });

      // Form fade-in
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 56 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 88%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/services/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, serviceType: selectedService, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setStatus("error");
      } else {
        setStatus("success");
        setName("");
        setEmail("");
        setMessage("");
        setSelectedService("");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  };

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 px-6 md:px-12 max-w-5xl mx-auto"
      aria-labelledby="services-heading"
    >
      {/* Section heading */}
      <h2
        ref={headingRef}
        id="services-heading"
        className="text-3xl md:text-4xl font-serif text-foreground mb-3 opacity-0"
        style={{ letterSpacing: "0.01em" }}
      >
        Services we provide
      </h2>
      <div
        className="w-16 h-px bg-[var(--color-gold,#c4a24d)] mb-12 opacity-60"
        aria-hidden="true"
      />

      {/* Service cards */}
      <div className="grid gap-8 md:grid-cols-3 mb-20">
        {SERVICES.map((service, i) => (
          <div
            key={service.id}
            ref={(el) => { itemRefs.current[i] = el; }}
            className="opacity-0 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-7 flex flex-col gap-3 hover:border-white/20 transition-colors duration-300"
          >
            <span
              className="text-xs uppercase tracking-widest text-[var(--color-gold,#c4a24d)] font-medium"
              aria-hidden="true"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-lg font-serif text-foreground">{service.title}</h3>
            <p className="text-sm leading-relaxed text-foreground/70">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* Contact form */}
      <div ref={formRef} className="opacity-0">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-8 md:p-12">
          <p className="text-xs uppercase tracking-widest text-[var(--color-gold,#c4a24d)] font-medium mb-2">
            🌱 Editorial Board
          </p>
          <h3 className="text-2xl font-serif text-foreground mb-8">
            Get in touch
          </h3>

          {status === "success" ? (
            <div className="text-center py-12">
              <p className="text-lg font-serif text-foreground mb-2">
                Thank you — your message has been received.
              </p>
              <p className="text-sm text-foreground/60">
                The editorial board will be in touch with you.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="si-name"
                    className="text-xs uppercase tracking-wide text-foreground/50"
                  >
                    Your name
                  </label>
                  <input
                    id="si-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="si-email"
                    className="text-xs uppercase tracking-wide text-foreground/50"
                  >
                    Email address
                  </label>
                  <input
                    id="si-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-white/30 transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="si-service"
                  className="text-xs uppercase tracking-wide text-foreground/50"
                >
                  Which service interests you?
                </label>
                <select
                  id="si-service"
                  required
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-white/30 transition-colors appearance-none"
                >
                  <option value="" disabled className="bg-background">
                    Select a service…
                  </option>
                  {SERVICES.map((s) => (
                    <option key={s.id} value={s.id} className="bg-background">
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="si-message"
                  className="text-xs uppercase tracking-wide text-foreground/50"
                >
                  Tell us about your work
                </label>
                <textarea
                  id="si-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A little about where you are in your writing, what you're working on, or what you're hoping to get from working together…"
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-400" role="alert">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "sending"}
                className="self-start px-8 py-3 rounded-lg bg-[var(--color-gold,#c4a24d)] text-black text-sm font-medium tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "sending" ? "Sending…" : "Send to editorial board"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
