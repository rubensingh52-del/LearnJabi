import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="page-enter mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
      <Link href="/">
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-8">
          <ChevronLeft className="h-4 w-4" /> Back to home
        </span>
      </Link>

      <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="prose prose-sm max-w-none space-y-6 text-sm text-foreground leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-2">1. Introduction</h2>
          <p>LearnJabi ("we", "us") is committed to protecting your privacy. This policy explains what personal information we collect, how we use it, and your rights.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account information:</strong> When you register, we collect your email address, username, and a hashed password (stored securely via Supabase Auth).</li>
            <li><strong>Learning progress:</strong> We store which lessons you have completed and your quiz scores, linked to your account.</li>
            <li><strong>Contact form submissions:</strong> If you contact us via the form, your name, email, and message are sent to us via Formspree.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To provide and improve the LearnJabi learning experience.</li>
            <li>To save and display your progress across devices.</li>
            <li>To respond to your contact form messages.</li>
            <li>We do not sell your data to third parties.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. Third-Party Services</h2>
          <p>LearnJabi uses the following third-party services:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Supabase</strong> — for authentication and database storage. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Supabase's Privacy Policy</a>.</li>
            <li><strong>Formspree</strong> — for contact form delivery. See <a href="https://formspree.io/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Formspree's Privacy Policy</a>.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Cookies & Local Storage</h2>
          <p>We use browser local storage to remember your theme preference (light/dark mode). We do not use advertising cookies or tracking cookies.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">6. Data Retention</h2>
          <p>Your account data is retained for as long as your account is active. You may request deletion of your account and associated data by contacting us.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Your Rights</h2>
          <p>You have the right to access, correct, or delete your personal data. To exercise these rights, please contact us via the <Link href="/"><span className="text-primary underline cursor-pointer">homepage contact form</span></Link>.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We encourage you to review it periodically.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">9. Contact</h2>
          <p>For any privacy-related questions, please use the Contact form on the <Link href="/"><span className="text-primary underline cursor-pointer">LearnJabi homepage</span></Link>.</p>
        </section>
      </div>
    </div>
  );
}
