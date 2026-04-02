import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, MessageCircle, BarChart3, Globe2, Sparkles, ChevronRight, Mail, CheckCircle, Volume2, Zap, Star } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Structured Curriculum", desc: "From Gurmukhi script basics to conversational fluency, learn through carefully sequenced units and lessons." },
  { icon: Volume2, title: "Pronunciation Built In", desc: "Every Gurmukhi word includes its romanised pronunciation (e.g. ਸਤ ਸ੍ਰੀ ਅਕਾਲ → Sat Sri Akal) — no prior script knowledge needed." },
  { icon: MessageCircle, title: "Interactive Practice", desc: "Reinforce your learning with flashcard decks and quizzes that test your vocabulary across every topic." },
  { icon: BarChart3, title: "Track Your Progress", desc: "See how far you've come with detailed progress tracking across every unit and lesson." },
];

const lessonCards = [
  {
    emoji: "🔤",
    tag: "Unit 1",
    title: "Gurmukhi Alphabet",
    desc: "Learn the 35 letters of the Punjabi script",
    accent: "text-violet-500",
    border: "border-violet-500/20",
    chars: ["ਸ", "ਹ", "ਕ", "ਖ", "ਗ"],
  },
  {
    emoji: "👋",
    tag: "Unit 2",
    title: "Greetings & Basics",
    desc: "Say hello, introduce yourself, and be polite",
    accent: "text-emerald-500",
    border: "border-emerald-500/20",
    preview: [{ p: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", r: "Sat Sri Akal", e: "Hello" }, { p: "ਧੰਨਵਾਦ", r: "Dhanvaad", e: "Thank you" }],
  },
  {
    emoji: "🔢",
    tag: "Unit 3",
    title: "Numbers & Counting",
    desc: "Count from 1 to 100 in Punjabi",
    accent: "text-orange-500",
    border: "border-orange-500/20",
    preview: [{ p: "ਇੱਕ", r: "Ikk", e: "One" }, { p: "ਦੋ", r: "Do", e: "Two" }, { p: "ਤਿੰਨ", r: "Tinn", e: "Three" }],
  },
  {
    emoji: "👨‍👩‍👧",
    tag: "Unit 4",
    title: "Family & Relationships",
    desc: "Talk about your loved ones in Punjabi",
    accent: "text-rose-500",
    border: "border-rose-500/20",
    preview: [{ p: "ਮਾਂ", r: "Maa", e: "Mother" }, { p: "ਪਿਤਾ", r: "Pita", e: "Father" }, { p: "ਭੈਣ", r: "Bhain", e: "Sister" }],
  },
  {
    emoji: "🍛",
    tag: "Unit 5",
    title: "Food & Culture",
    desc: "Vocabulary for Punjabi cuisine and traditions",
    accent: "text-yellow-600",
    border: "border-yellow-500/20",
    preview: [{ p: "ਰੋਟੀ", r: "Roti", e: "Bread" }, { p: "ਦਾਲ", r: "Daal", e: "Lentils" }, { p: "ਮੱਖਣ", r: "Makkhan", e: "Butter" }],
  },
  {
    emoji: "📍",
    tag: "Unit 6",
    title: "Places & Travel",
    desc: "Navigate cities, ask for directions, describe locations",
    accent: "text-sky-500",
    border: "border-sky-500/20",
    preview: [{ p: "ਘਰ", r: "Ghar", e: "Home" }, { p: "ਸਕੂਲ", r: "Skool", e: "School" }, { p: "ਬਾਜ਼ਾਰ", r: "Baazaar", e: "Market" }],
  },
  {
    emoji: "🎭",
    tag: "Unit 7",
    title: "Emotions & Feelings",
    desc: "Express how you feel in everyday Punjabi",
    accent: "text-fuchsia-500",
    border: "border-fuchsia-500/20",
    preview: [{ p: "ਖੁਸ਼ੀ", r: "Khushi", e: "Happy" }, { p: "ਦੁਟਿਆ", r: "Dukhi", e: "Sad" }, { p: "ਥੱਕਾ", r: "Thakka", e: "Tired" }],
  },
  {
    emoji: "⏰",
    tag: "Unit 8",
    title: "Time & Daily Routine",
    desc: "Talk about days, weeks, and your daily schedule",
    accent: "text-teal-500",
    border: "border-teal-500/20",
    preview: [{ p: "ਸਵੇਰ", r: "Saver", e: "Morning" }, { p: "ਸ਼ਾਮ", r: "Shaam", e: "Evening" }, { p: "ਅੱਜ", r: "Ajj", e: "Today" }],
  },
];

export default function Landing() {
  const [formState, setFormState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [activeCard, setActiveCard] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCard(prev => (prev + 1) % lessonCards.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormState("sending");
    try {
      const res = await fetch("https://formspree.io/f/mykbpqny", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) { setFormState("sent"); setFormData({ name: "", email: "", message: "" }); }
      else setFormState("error");
    } catch { setFormState("error"); }
  }

  const card = lessonCards[activeCard];

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none select-none" aria-hidden="true">
          <div
            className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[100px]"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
              animation: "glow-drift 8s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute top-20 right-0 w-[400px] h-[400px] rounded-full opacity-[0.05] blur-[80px]"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)",
              animation: "glow-drift 11s ease-in-out infinite alternate-reverse",
            }}
          />
        </div>

        <style>{`
          @keyframes glow-drift {
            0%   { transform: translate(0, 0) scale(1); }
            50%  { transform: translate(40px, 30px) scale(1.08); }
            100% { transform: translate(-20px, 50px) scale(0.95); }
          }
          @keyframes card-in {
            0%   { opacity: 0; transform: translateY(16px) scale(0.97); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .card-animate { animation: card-in 0.45s cubic-bezier(0.16,1,0.3,1) both; }
        `}</style>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

            {/* Left — text */}
            <div className="flex-1 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
                <Sparkles className="h-3 w-3" />
                AI-Powered Language Learning
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-4">
                Learn Punjabi,{" "}
                <span className="text-primary">connect with your roots</span>
              </h1>

              <p className="text-base text-muted-foreground leading-relaxed mb-3 max-w-lg">
                Master Punjabi vocabulary and phrases through structured lessons — no Gurmukhi reading experience needed. Every word shows its <span className="font-semibold text-foreground">romanised pronunciation</span> right next to the script.
              </p>

              {/* Pronunciation example pill */}
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-lg bg-card border border-border/60 text-sm">
                <span className="gurmukhi font-semibold">ਸਤ ਸ੍ਰੀ ਅਕਾਲ</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-primary font-medium italic">Sat Sri Akal</span>
                <span className="text-muted-foreground">→</span>
                <span className="font-medium">Hello</span>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-5 mb-8">
                {[
                  { icon: BookOpen, val: "50+",  label: "Lessons" },
                  { icon: Volume2,  val: "400+", label: "Words with pronunciation" },
                  { icon: Zap,      val: "8",    label: "Units" },
                  { icon: Star,     val: "Free", label: "Always" },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                      <s.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-foreground">{s.val}</span>
                      <span className="text-xs text-muted-foreground ml-1">{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/learn">
                  <Button size="lg" className="gap-2">
                    Start Learning Free <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/practice">
                  <Button size="lg" variant="secondary" className="gap-2">
                    <MessageCircle className="h-4 w-4" /> Try Practice Mode
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — animated lesson showcase */}
            <div className="flex-shrink-0 w-full max-w-xs lg:max-w-sm">
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-2xl blur-2xl opacity-30 transition-all duration-700"
                  style={{ background: `linear-gradient(135deg, hsl(var(--primary)), transparent)` }}
                />

                <div
                  key={activeCard}
                  className={`card-animate relative rounded-2xl border bg-card p-6 shadow-lg ${card.border}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 ${card.accent}`}>
                      {card.tag}
                    </span>
                    <span className="text-2xl">{card.emoji}</span>
                  </div>

                  <h3 className="text-base font-bold mb-1">{card.title}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{card.desc}</p>

                  {card.chars ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {card.chars.map((ch) => (
                        <div key={ch} className="gurmukhi w-10 h-10 rounded-lg bg-background border border-border/60 flex items-center justify-center text-base font-semibold text-foreground/80">
                          {ch}
                        </div>
                      ))}
                      <div className="gurmukhi w-10 h-10 rounded-lg border border-dashed border-border/40 flex items-center justify-center text-xs text-muted-foreground">+30</div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 mb-4">
                      {((card as any).preview ?? []).map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-background border border-border/50 px-3 py-2">
                          <div className="flex flex-col">
                            <span className="gurmukhi text-sm font-semibold">{item.p}</span>
                            {item.r && <span className="text-xs text-primary/70 italic">{item.r}</span>}
                          </div>
                          <span className={`text-xs font-medium ${card.accent}`}>{item.e}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-border/60">
                      <div className="h-full rounded-full bg-primary" style={{ width: "0%" }} />
                    </div>
                    <span className="text-xs text-muted-foreground">Not started</span>
                  </div>
                </div>

                <div className="flex justify-center gap-1.5 mt-4">
                  {lessonCards.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveCard(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === activeCard ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-border"
                      }`}
                      aria-label={`Show lesson ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Script Preview */}
      <section className="border-y border-border/60 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold mb-2">The Beauty of Gurmukhi</h2>
            <p className="text-sm text-muted-foreground">The script used to write Punjabi — elegant, phonetic, and deeply cultural. Don't worry about reading it fluently; every lesson includes the romanised pronunciation.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            {[
              { ch: "ਸ", r: "Sa" }, { ch: "ਹ", r: "Ha" }, { ch: "ਕ", r: "Ka" }, { ch: "ਖ", r: "Kha" },
              { ch: "ਗ", r: "Ga" }, { ch: "ਘ", r: "Gha" }, { ch: "ਚ", r: "Cha" }, { ch: "ਛ", r: "Chha" },
              { ch: "ਜ", r: "Ja" }, { ch: "ਝ", r: "Jha" }, { ch: "ਟ", r: "Ta" }, { ch: "ਠ", r: "Tha" },
              { ch: "ਡ", r: "Da" }, { ch: "ਢ", r: "Dha" }, { ch: "ਣ", r: "Na" },
            ].map(({ ch, r }, i) => (
              <div
                key={ch}
                className="flex flex-col items-center gap-0.5 w-12 sm:w-14 transition-all duration-200 hover:scale-105 group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="gurmukhi w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-background border border-border/60 flex items-center justify-center text-lg sm:text-xl font-semibold text-foreground/80 transition-all group-hover:border-primary/40 group-hover:text-primary">
                  {ch}
                </div>
                <span className="text-[10px] text-muted-foreground italic">{r}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12">
            <h2 className="text-xl font-bold mb-2">Everything you need to learn Punjabi</h2>
            <p className="text-sm text-muted-foreground max-w-lg">A complete learning system built for heritage learners and beginners — structured, interactive, and effective.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div key={f.title} className="group p-6 rounded-xl bg-card border border-card-border transition-all duration-200 hover:border-primary/30" data-testid={`card-feature-${i}`}>
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
            <h2 className="text-xl font-bold mb-2">Start speaking from day one</h2>
            <p className="text-sm text-muted-foreground">Here's a taste of what you'll learn — Gurmukhi script, romanised pronunciation, and English meaning together</p>
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
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-background border border-border/50">
                <div className="flex-1 min-w-0">
                  <p className="gurmukhi text-lg font-semibold text-foreground mb-0.5">{phrase.p}</p>
                  <p className="text-sm text-primary font-medium italic mb-1">{phrase.r}</p>
                  <p className="text-sm font-medium text-muted-foreground">{phrase.e}</p>
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
              <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground mb-3">Ready to start your Punjabi journey?</h2>
              <p className="text-sm text-primary-foreground/80 mb-6 max-w-md mx-auto">Join thousands of heritage learners reconnecting with their language and culture.</p>
              <Link href="/learn">
                <Button size="lg" variant="secondary" className="gap-2">
                  Begin Learning Now <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
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
              <button className="mt-2 text-sm text-primary underline underline-offset-2" onClick={() => setFormState("idle")}>Send another message</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-name" className="text-sm font-medium">Name</label>
                  <input id="contact-name" type="text" required placeholder="Your name" value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="contact-email" className="text-sm font-medium">Email</label>
                  <input id="contact-email" type="email" required placeholder="your@email.com" value={formData.email} onChange={e => setFormData(d => ({ ...d, email: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contact-message" className="text-sm font-medium">Message</label>
                <textarea id="contact-message" required rows={5} placeholder="Write your message here..." value={formData.message} onChange={e => setFormData(d => ({ ...d, message: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none" />
              </div>
              {formState === "error" && <p className="text-sm text-destructive">Something went wrong. Please try again or email us directly at rubensingh52@gmail.com.</p>}
              <Button type="submit" disabled={formState === "sending"} className="self-end gap-2">
                {formState === "sending" ? "Sending..." : "Send Message"} <Mail className="h-4 w-4" />
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
