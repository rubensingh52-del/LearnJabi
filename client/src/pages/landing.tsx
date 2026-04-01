import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, BarChart3, Globe2, Sparkles, ChevronRight, Mail, CheckCircle } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Structured Curriculum",
    desc: "From Gurmukhi script basics to conversational fluency, learn through carefully sequenced units and lessons.",
  },
  {
    icon: MessageCircle,
    title: "Interactive Practice",
    desc: "Reinforce your learning with flashcard decks and quizzes that test your vocabulary across every topic.",
  },
  {
    icon: BarChart3,
    title: "Track Your Progress",
    desc: "See how far you've come with detailed progress tracking across every unit and lesson.",
  },
];

export default function Landing() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("sending");
    try {
      const res = await fetch("https://formspree.io/f/xpwzgkbq", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setFormState("sent");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setFormState("error");
      }
    } catch {
      setFormState("error");
    }
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6" data-testid="badge-hero">
              <Sparkles className="h-3 w-3" />
              AI-Powered Language Learning
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight mb-4" data-testid="text-hero-title">
              Learn Punjabi,{" "}
              <span className="text-primary">connect with your roots</span>
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-lg" data-testid="text-hero-desc">
              Master Gurmukhi script, build vocabulary, and practice with interactive quizzes — all in one beautiful platform designed for heritage learners and beginners alike.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/learn">
                <Button size="lg" className="gap-2" data-testid="button-hero-start">
                  Start Learning Free
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/practice">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-hero-practice">
                  <MessageCircle className="h-4 w-4" />
                  Try Practice Mode
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative Gurmukhi characters - right side */}
          <div className="absolute right-8 top-16 hidden lg:block opacity-[0.04] pointer-events-none select-none" aria-hidden="true">
            <div className="gurmukhi text-[180px] font-bold leading-none">
              ੴ
            </div>
          </div>
        </div>
      </section>

      {/* Script Preview */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold mb-2" data-testid="text-script-title">The Beauty of Gurmukhi</h2>
            <p className="text-sm text-muted-foreground">The script used to write Punjabi — elegant, phonetic, and deeply cultural</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {["ਸ","ਹ","ਕ","ਖ","ਗ","ਘ","ਚ","ਛ","ਜ","ਝ","ਟ","ਠ","ਡ","ਢ","ਣ"].map((char, i) => (
              <div
                key={char}
                className="gurmukhi w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-background border border-border/60 flex items-center justify-center text-lg sm:text-xl font-semibold text-foreground/80 transition-all duration-200 hover:border-primary/40 hover:text-primary hover:scale-105"
                style={{ animationDelay: `${i * 50}ms` }}
                data-testid={`char-${char}`}
              >
                {char}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-2" data-testid="text-features-title">Everything you need to learn Punjabi</h2>
            <p className="text-sm text-muted-foreground max-w-lg">A complete learning system built for the modern learner — structured, interactive, and effective.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 rounded-xl bg-card border border-card-border transition-all duration-200 hover:border-primary/30"
                data-testid={`card-feature-${i}`}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Phrases */}
      <section className="border-t border-border/60 bg-card/30 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10">
            <h2 className="text-xl font-bold mb-2" data-testid="text-phrases-title">Start speaking from day one</h2>
            <p className="text-sm text-muted-foreground">Here's a taste of what you'll learn in your first lessons</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { p: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", r: "Sat Sri Akal", e: "Hello" },
              { p: "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?", r: "Tusi kive ho?", e: "How are you?" },
              { p: "ਮੇਰਾ ਨਾਮ ___ ਹੈ", r: "Mera naam ___ hai", e: "My name is ___" },
              { p: "ਸ਼ੁਕਰੀਆ", r: "Shukriya", e: "Thank you" },
              { p: "ਕਿਰਪਾ ਕਰਕੇ", r: "Kirpa karke", e: "Please" },
              { p: "ਮੈਂ ਪੰਜਾਬੀ ਸਿੱਖ ਰਿਹਾ ਹਾਂ", r: "Mai Punjabi sikkh riha haan", e: "I am learning Punjabi" },
            ].map((phrase, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border/50"
                data-testid={`phrase-${i}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="gurmukhi text-lg font-semibold text-foreground mb-0.5">{phrase.p}</p>
                  <p className="text-sm text-muted-foreground italic">{phrase.r}</p>
                  <p className="text-sm font-medium text-primary mt-1">{phrase.e}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative rounded-2xl bg-primary p-8 sm:p-12 text-center overflow-hidden">
            <div className="relative z-10">
              <Globe2 className="h-8 w-8 text-primary-foreground/80 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-3" data-testid="text-cta-title">
                Ready to start your Punjabi journey?
              </h2>
              <p className="text-sm text-primary-foreground/80 mb-6 max-w-md mx-auto">
                Join thousands of heritage learners reconnecting with their language and culture.
              </p>
              <Link href="/learn">
                <Button size="lg" variant="secondary" className="gap-2" data-testid="button-cta-start">
                  Begin Learning Now
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            {/* Subtle pattern */}
            <div className="absolute inset-0 opacity-10" aria-hidden="true">
              <div className="absolute -right-12 -top-12 gurmukhi text-[200px] text-primary-foreground font-bold">ੴ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="border-t border-border/60 bg-card/30 py-16 sm:py-20" id="contact">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mx-auto mb-4">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Contact Us</h2>
            <p className="text-sm text-muted-foreground">Have a question, suggestion, or just want to say hello? We'd love to hear from you.</p>
          </div>

          {formState === "sent" ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <CheckCircle className="h-10 w-10 text-primary" />
              <p className="text-base font-semibold">Message sent!</p>
              <p className="text-sm text-muted-foreground">Thanks for reaching out — we'll get back to you soon.</p>
              <button
                className="mt-2 text-sm text-primary underline underline-offset-2"
                onClick={() => setFormState("idle")}
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-name" className="text-sm font-medium">Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    placeholder="Your name"
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-sm font-medium">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  value={formData.message}
                  onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
                  className="rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none"
                />
              </div>
              {formState === "error" && (
                <p className="text-sm text-destructive">Something went wrong. Please try again or email us directly at rubensingh52@gmail.com.</p>
              )}
              <Button type="submit" disabled={formState === "sending"} className="self-end gap-2">
                {formState === "sending" ? "Sending..." : "Send Message"}
                <Mail className="h-4 w-4" />
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none" aria-label="LearnJabi logo">
              <rect x="2" y="2" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <text x="16" y="22" textAnchor="middle" className="gurmukhi" fill="currentColor" fontSize="16" fontWeight="700" style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif" }}>ਸ਼</text>
            </svg>
            <span className="text-sm font-semibold">LearnJabi</span>
          </div>
          <p className="text-xs text-muted-foreground">Built with care for Punjabi learners everywhere</p>
        </div>
      </footer>
    </div>
  );
}
