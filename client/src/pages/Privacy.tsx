import Navigation from "@/components/Navigation";
import StarBackground from "@/components/StarBackground";
import { motion } from "framer-motion";
import { Link } from "wouter";

export default function Privacy() {
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
          <h1 className="text-4xl md:text-5xl font-display font-light tracking-normal italic mb-12">
            Privacy Policy
          </h1>
          <div className="prose prose-invert max-w-none space-y-8 text-white/70 leading-relaxed">
            <p className="text-lg">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">1. Information We Collect</h2>
              <p>The Page Gallery & Garden collects information you provide when creating an account, including your name, email address, and profile information. We also collect content you submit, such as written pieces, editorial notes, and comments.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">2. How We Use Your Information</h2>
              <p>We use your information to operate and improve The Page Gallery & Garden, including managing your account, displaying your published works, facilitating editorial workflows, and communicating important updates about the platform.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">3. Content &amp; Publishing</h2>
              <p>Content you submit may be reviewed by editors. Published pieces appear in our public gallery. You retain ownership of your original works. We display your author name and bio alongside published pieces.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information. Authentication is handled through secure protocols. However, no method of electronic transmission is 100% secure.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">5. Cookies &amp; Analytics</h2>
              <p>We use essential cookies to maintain your session and preferences. We may use analytics to understand how our platform is used and to improve the experience for our writers and readers.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">6. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data at any time. You may also request export of your submitted works. Contact us at the email below for any privacy-related requests.</p>
            </section>
            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">7. Contact</h2>
              <p>For privacy inquiries, please contact us at privacy@thepagegalleryandgarden.com.</p>
            </section>
          </div>
          <div className="mt-16 pt-8 border-t border-white/10">
            <Link href="/terms" className="text-white/50 hover:text-white/80 transition-colors font-mono text-sm uppercase tracking-wider">
              Terms of Service &rarr;
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
