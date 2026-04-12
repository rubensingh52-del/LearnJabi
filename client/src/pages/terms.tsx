import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="page-enter mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
      <Link href="/">
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-8">
          <ChevronLeft className="h-4 w-4" /> Back to home
        </span>
      </Link>

      <h1 className="text-2xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>

      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-base font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using LearnJabi ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">2. Description of Service</h2>
          <p>LearnJabi is a free educational platform designed to help users learn the Punjabi language. It provides structured lessons, vocabulary exercises, flashcards, and practice tools.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">3. User Accounts</h2>
          <p>To access certain features (such as progress tracking and units beyond Unit 1), you must create a free account. You are responsible for maintaining the security of your account credentials and for all activity under your account.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">4. Acceptable Use</h2>
          <p>You agree not to misuse the Service. This includes, but is not limited to: attempting to access systems or data without authorisation, distributing harmful content, or using the Service for any unlawful purpose.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">5. Intellectual Property</h2>
          <p>All content on LearnJabi, including lesson material, design, and code, is the property of LearnJabi and its creator. You may not copy, reproduce, or redistribute it without permission.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">6. Disclaimer of Warranties</h2>
          <p>LearnJabi is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or continuous availability of the Service.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">7. Limitation of Liability</h2>
          <p>To the fullest extent permitted by law, LearnJabi and its creator shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">8. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes your acceptance of the updated Terms.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold mb-2">9. Contact</h2>
          <p>For questions about these Terms, please use the Contact form on the <Link href="/"><span className="text-primary underline cursor-pointer">LearnJabi homepage</span></Link>.</p>
        </section>
      </div>
    </div>
  );
}
