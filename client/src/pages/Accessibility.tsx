import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Accessibility() {
  return (
    <div className="min-h-screen bg-transparent text-foreground selection:bg-secondary selection:text-background">
      <Navigation />
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-light tracking-normal text-white mb-8">
            Accessibility
          </h1>

          <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">
            <p className="text-lg">
              The Page Gallery & Garden is committed to making our platform accessible to all writers and readers, including those with disabilities.
            </p>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">Our commitment</h2>
              <p>
                We specifically welcome neurodivergent writers and readers. Accessibility is not an afterthought for us — it is a core part of how we build. A platform that invites people to share unfinished, vulnerable work must feel safe and navigable for everyone.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">What we currently support</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keyboard navigation throughout the site</li>
                <li>An accessibility toolbar (bottom-right of every page) with options for increased text size, high contrast mode, reduced motion, and a dyslexia-friendly font</li>
                <li>Semantic HTML and ARIA landmarks for screen reader compatibility</li>
                <li>Dark and light mode toggle</li>
                <li>Responsive design across mobile, tablet, and desktop</li>
                <li>Skip-to-content support for keyboard users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">Standards we are working toward</h2>
              <p>
                We are actively working toward WCAG 2.2 Level AA compliance. This includes ongoing testing of colour contrast ratios, touch target sizes, and focus management across all pages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">Known limitations</h2>
              <p>
                We are a small team and our platform is evolving. Some areas we are still improving:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Contrast ratios on some illustrated or textured backgrounds may not yet meet AA minimums</li>
                <li>The Garden writing environment is under active development and may have accessibility gaps we have not yet identified</li>
                <li>Screen reader testing has been limited to VoiceOver on macOS — we plan to expand to NVDA and JAWS</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">Feedback</h2>
              <p>
                If you encounter any accessibility barriers on our site, or if there is something we can do to make your experience better, please let us know at{" "}
                <a href="mailto:hello@thepagegalleryjournal.com" className="text-white underline underline-offset-4 hover:text-white/80 transition-colors">
                  hello@thepagegalleryjournal.com
                </a>.
                We take every report seriously and will do our best to respond within 5 working days.
              </p>
            </section>

            <p className="text-sm text-white/40 pt-8 border-t border-white/10">
              This statement was last updated on {new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" })}.
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}
