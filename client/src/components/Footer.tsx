import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-transparent text-primary py-32 px-6 md:px-12 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(196,162,77,0.03) 0%, transparent 50%)" }} />

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 relative z-10">
        <div className="space-y-8 max-w-2xl">
          <motion.h2
            className="text-4xl md:text-6xl font-display font-light leading-tight italic"
            initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            You tend your Garden.<br/>We tend our attention.
          </motion.h2>
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true }}
          >
            <Link href="/garden" className="px-8 py-4 bg-primary text-background font-mono text-sm uppercase tracking-widest hover:bg-secondary transition-colors" data-testid="footer-enter-garden">
              Enter The Garden
            </Link>
            <Link href="/in-bloom" className="px-8 py-4 border border-white/20 text-primary font-mono text-sm uppercase tracking-widest hover:bg-white/5 transition-colors" data-testid="footer-read-gallery">
              Read In Bloom
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="text-right space-y-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Link href="/about" className="block font-mono text-xs uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors" data-testid="footer-about">
            Our Philosophy
          </Link>
          <div className="space-y-2 opacity-50 font-mono text-xs uppercase tracking-widest">
            <p>The Page Gallery Journal © 2026</p>
            <p>Curated by Attention</p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
