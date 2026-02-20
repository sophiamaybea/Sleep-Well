import Navigation from "@/components/Navigation";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Terms() {
  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-background relative">
      <StarBackground />
      <Navigation />
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-light tracking-tight italic mb-12">
            Terms of Service
          </h1>
          <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">
            <p className="text-lg">Effective Date: February 2025</p>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing or using The Page Gallery & Garden, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">2. User Accounts</h2>
              <p>You are responsible for maintaining the confidentiality of your account. You must provide accurate information when registering. One person may not maintain multiple accounts. We reserve the right to suspend accounts that violate these terms.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">3. Content Ownership</h2>
              <p>You retain full ownership of all original works you submit to The Page Gallery & Garden. By submitting content, you grant us a non-exclusive license to display, publish, and distribute your work within our platform and associated publications.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">4. Editorial Process</h2>
              <p>Submitted works may be reviewed by our editorial team. Editors may suggest revisions but will not alter your work without consent. The Editor-in-Chief has final authority over publication decisions.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">5. Prohibited Conduct</h2>
              <p>You may not submit plagiarized content, harass other users, attempt to access unauthorized areas of the platform, or use the service for any unlawful purpose. Violation may result in immediate account termination.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">6. Termination</h2>
              <p>We may terminate or suspend your account at our discretion. Upon termination, you may request export of your original content. We will make reasonable efforts to accommodate such requests.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">7. Changes to Terms</h2>
              <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms. We will notify users of material changes via email or platform notification.</p>
            </section>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10">
            <Link href="/privacy" className="text-white/50 hover:text-white/80 transition-colors font-mono text-sm uppercase tracking-wider">
              Privacy Policy &rarr;
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
