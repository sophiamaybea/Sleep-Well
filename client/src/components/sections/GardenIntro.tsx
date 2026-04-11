import { motion } from "framer-motion";
import { useRef } from "react";
import { Link } from "wouter";

const stages = [
  {
    stage: "Draft",
    icon: null,
    color: "text-[#6B2A2A]",
    borderColor: "border-[rgba(107,42,42,0.2)]",
    desc: "A private desk for first drafts, fragments, and rough edges. Yours alone until you decide otherwise.",
  },
  {
    stage: "Revise",
    icon: null,
    color: "text-[#8A8F6F]",
    borderColor: "border-[rgba(138,143,111,0.3)]",
    desc: "Reshape, sharpen, let the work find its form. Still private, still yours.",
  },
  {
    stage: "Publish",
    icon: null,
    color: "text-[#c4a24d]",
    borderColor: "border-[rgba(196,162,77,0.3)]",
    desc: "When you're ready, surface your work. Our editors read the desk. When something stops them, they reach out.",
  },
];

function StageRow({ item, index }: { item: typeof stages[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 + index * 0.15 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -2 }}
      className={`flex items-start gap-8 md:gap-12 py-8 md:py-12 relative cursor-default ${
        index % 2 === 1 ? "md:flex-row-reverse md:text-right" : ""
      }`}
      data-testid={`card-stage-${item.stage.toLowerCase()}`}
    >
      {/* Stage number + label */}
      <div className={`flex-shrink-0 flex flex-col items-center gap-2`}>
        <span className={`font-mono text-[10px] uppercase tracking-[0.2em] ${item.color}`}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className={`w-[1px] h-12 bg-current opacity-20 ${item.color}`} />
      </div>

      {/* Text */}
      <div className="space-y-3 relative z-10">
        <h3 className={`font-display text-2xl md:text-3xl font-light italic ${item.color}`}>
          {item.stage}
        </h3>
        <p className="font-sans text-base md:text-lg leading-relaxed text-[#1C1208]/50 max-w-md">
          {item.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function GardenIntro() {
  return (
    <section className="relative py-32 md:py-48 px-6 md:px-12 overflow-hidden studio-paper">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="font-mono text-[length:var(--text-label)] tracking-[0.2em] text-[#1C1208]/30 uppercase block mb-6"
          >
            Your Writing Desk
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
            className="font-display text-5xl md:text-7xl font-light italic text-[#1C1208]"
          >
            The Desk
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="font-display italic text-lg md:text-xl text-[#1C1208]/40 mt-6 max-w-xl mx-auto"
          >
            A private space for drafts, fragments, and half-formed ideas.
            Yours alone, until you decide otherwise.
          </motion.p>
        </div>

        {/* Stages */}
        <div className="space-y-4 md:space-y-0 divide-y divide-[rgba(107,42,42,0.08)]">
          {stages.map((item, i) => (
            <StageRow key={item.stage} item={item} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          viewport={{ once: true }}
          className="text-center mt-24"
        >
          <Link
            href="/garden"
            className="inline-block font-display italic text-lg text-[#1C1208]/40 hover:text-[#6B2A2A] transition-colors duration-500 border-b border-[rgba(107,42,42,0.2)] hover:border-[#6B2A2A] pb-1"
            data-testid="link-enter-garden"
          >
            Take a seat at the desk &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
