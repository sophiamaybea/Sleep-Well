import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

export default function SocialCTA() {
  return (
    <section className="relative py-32 px-6 studio-paper">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center space-y-10 relative z-10"
      >
        <div className="space-y-4">
          <motion.span
            className="font-mono text-[10px] tracking-[0.4em] text-[#6B2A2A]/60 block uppercase"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Follow Along
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-display font-light italic tracking-normal text-[#1C1208]/80">
            The studio is open
          </h2>
          <p className="font-display italic text-[#1C1208]/40 text-[15px] leading-relaxed max-w-sm mx-auto">
            New work, editorial notes, and glimpses of what's on the desk.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="https://instagram.com/pagegalleryjournal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-8 py-3.5 border border-[rgba(107,42,42,0.2)] hover:border-[#6B2A2A]/50 bg-transparent hover:bg-[#6B2A2A]/5 text-[#1C1208]/50 hover:text-[#6B2A2A] transition-all duration-400 rounded-none group"
          >
            <Instagram size={16} className="opacity-60 group-hover:opacity-100 transition-opacity duration-400" />
            <span className="font-mono text-[11px] tracking-[0.2em] uppercase">@pagegalleryjournal</span>
          </a>
        </div>
        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#6B2A2A]/20" />
          <div className="w-1 h-1 rotate-45 border border-[#6B2A2A]/20" />
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#6B2A2A]/20" />
        </div>
      </motion.div>
    </section>
  );
}


