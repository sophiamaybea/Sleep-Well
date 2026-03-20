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
              <p>The Page Gallery & Garden collects information you provide when creating an account, including your name, email address, and profile information. We also collect content you choose to submit for publication, such as written pieces, editorial notes, and comments.</p>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">2. How We Use Your Information</h2>
              <p>We use your information solely to operate The Page Gallery & Garden, including managing your account, displaying your published works, facilitating editorial workflows, and communicating important updates about the platform. We do not use your information to improve the gallery or for any purpose beyond running the platform for you.</p>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">3. We Never Share Your Information</h2>
              <p>We do not sell, trade, rent, or give out your personal information to any third parties. Your data stays with us and is used only to provide you with the platform experience. We will never share your information with advertisers, partners, or any outside parties for any reason.</p>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">4. Content & Privacy</h2>
              <p>Your writing is yours. We do not read, access, or review any of your private or unpublished work unless you explicitly choose to submit it to us for editorial review or publication. Only content you voluntarily send to our editors will be reviewed. Published pieces appear in our public gallery. You retain full ownership of all your original works. We display your author name and bio alongside published pieces only with your consent.</p>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">5. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information. Authentication is handled through secure protocols. However, no method of electronic transmission is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">6. Cookies & Analytics</h2>
              <p>We use essential cookies to maintain your session and preferences. We may use basic analytics to understand general platform usage patterns, but we do not track individual user behavior or use this data to build user profiles.</p>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">7. Your Rights</h2>
              <p>You may request access to, correction of, or deletion of your personal data at any time. You may also request export of your submitted works. Contact us at the email below for any privacy-related requests.</p>
            </section>

            <section>
              <h2 className="text-2xl font-display text-white/90 mb-4">8. Contact</h2>
              <p>For privacy inquiries, please contact us at privacy@thepagegalleryandgarden.com.</p>
            </section>

          </div>
          <div className="mt-16 pt-8 border-t border-white/10">
            <Link href="/terms" className="text-white/50 hover:text-white/80 transition-colors font-mono text-sm uppercase tracking-wider">
              Terms of Service →
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
