import { useLocation, Link } from "wouter";
import { Sun, Moon, Menu, X, Sparkles, LogOut, LogIn, Mail, CheckCircle, Coffee } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";

const navLinks = [
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Practice" },
  { href: "/progress", label: "Progress" },
];

export function NavHeader() {
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTutorToast, setShowTutorToast] = useState(false);
  const { user, loading, signOut } = useAuth();
  const [showContact, setShowContact] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactState, setContactState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const displayName = user?.user_metadata?.username || user?.email?.split("@")[0] || "You";

  const handleTutorClick = () => {
    setShowTutorToast(true);
    setTimeout(() => setShowTutorToast(false), 3000);
  };

  const header = (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="LearnJabi logo">
                <rect x="2" y="2" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" className="text-primary" />
                <text x="16" y="22" textAnchor="middle" className="gurmukhi" fill="currentColor" fontSize="16" fontWeight="700" style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif" }}>ਸ਼</text>
              </svg>
              <span className="text-base font-bold tracking-tight" data-testid="text-logo">LearnJabi</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-1" data-testid="nav-desktop">
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                    location.startsWith(link.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  {link.label}
                </span>
              </Link>
            ))}

            {/* AI Tutor — Coming Soon */}
            <div className="relative">
              <button
                onClick={handleTutorClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                data-testid="link-ai-tutor"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                AI Tutor
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary leading-none">
                  Soon
                </span>
              </button>
              {showTutorToast && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-popover border border-border rounded-xl shadow-lg px-4 py-3 text-center w-56">
                    <Sparkles className="h-5 w-5 text-primary mx-auto mb-1.5" />
                    <p className="text-sm font-semibold mb-0.5">AI Tutor</p>
                    <p className="text-xs text-muted-foreground">Coming soon — practice Punjabi with an AI conversation partner.</p>
                  </div>
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-popover border-l border-t border-border" />
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Support Project */}
            <a
              href="https://buymeacoffee.com/rubensingh3"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors cursor-pointer"
              data-testid="link-support"
            >
              <Coffee className="h-3.5 w-3.5" />
              Support LearnJabi
            </a>

            {/* Contact Us — always visible */}
            <button
              onClick={() => { setShowContact(true); setContactState("idle"); }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              data-testid="button-contact-us"
            >
              <Mail className="h-3.5 w-3.5" />
              Contact Us
            </button>
            <Button size="icon" variant="ghost" onClick={toggle} data-testid="button-theme-toggle"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {!loading && (
              user ? (
                /* Logged in: show name + sign out */
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hi, <span className="font-medium text-foreground">{displayName}</span></span>
                  <Button size="sm" variant="ghost" onClick={signOut} className="gap-1.5" data-testid="button-sign-out">
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </Button>
                </div>
              ) : (
                /* Logged out: two separate buttons */
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="gap-1.5" data-testid="button-log-in">
                      <LogIn className="h-3.5 w-3.5" />
                      Log In
                    </Button>
                  </Link>
                  <Link href="/learn">
                    <Button size="sm" className="gap-1.5" data-testid="button-sign-in">
                      Start Learning
                    </Button>
                  </Link>
                </div>
              )
            )}

            <Button size="icon" variant="ghost" className="sm:hidden" onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu" aria-label="Toggle menu">
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <nav className="sm:hidden pb-4 pt-2 border-t border-border/40" data-testid="nav-mobile">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  <span onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      location.startsWith(link.href) ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                    data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, "-")}`}>
                    {link.label}
                  </span>
                </Link>
              ))}
              <button onClick={() => { setMobileOpen(false); handleTutorClick(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground cursor-pointer text-left"
                data-testid="link-mobile-ai-tutor">
                <Sparkles className="h-3.5 w-3.5 text-primary/70" />
                AI Tutor
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary leading-none">Soon</span>
              </button>

              {/* Support Project — mobile */}
              <a
                href="https://buymeacoffee.com/rubensingh3"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-amber-600 dark:text-amber-400 cursor-pointer text-left"
                data-testid="link-mobile-support"
              >
                <Coffee className="h-3.5 w-3.5" />
                Support LearnJabi
              </a>

              {/* Contact Us — mobile */}
              <button
                onClick={() => { setMobileOpen(false); setShowContact(true); setContactState("idle"); }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground cursor-pointer text-left"
                data-testid="link-mobile-contact"
              >
                <Mail className="h-3.5 w-3.5 text-primary/70" />
                Contact Us
              </button>

              {/* Mobile auth */}
              {!loading && (
                user ? (
                  <div className="mt-2 pt-2 border-t border-border/40">
                    <p className="px-3 py-1 text-xs text-muted-foreground">Signed in as <span className="font-medium text-foreground">{displayName}</span></p>
                    <button onClick={() => { setMobileOpen(false); signOut(); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground cursor-pointer w-full"
                      data-testid="button-mobile-sign-out">
                      <LogOut className="h-3.5 w-3.5" />
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-border/40 flex flex-col gap-2">
                    <Link href="/login">
                      <span onClick={() => setMobileOpen(false)}>
                        <Button size="sm" variant="outline" className="w-full gap-1.5" data-testid="button-mobile-log-in">
                          <LogIn className="h-3.5 w-3.5" />
                          Log In
                        </Button>
                      </span>
                    </Link>
                    <Link href="/learn">
                      <span onClick={() => setMobileOpen(false)}>
                        <Button size="sm" className="w-full" data-testid="button-mobile-start">
                          Start Learning
                        </Button>
                      </span>
                    </Link>
                  </div>
                )
              )}
            </div>
          </nav>
        )}
      </div>
      {showTutorToast && (
        <div className="sm:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="bg-popover border border-border rounded-xl shadow-lg px-4 py-3 text-center w-64 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-left">
              <p className="text-sm font-semibold">AI Tutor coming soon</p>
              <p className="text-xs text-muted-foreground">Practice Punjabi with an AI conversation partner.</p>
            </div>
          </div>
        </div>
      )}
    </header>
  );

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    setContactState("sending");
    try {
      const res = await fetch("https://formspree.io/f/mykbpqny", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactState("sent");
        setContactForm({ name: "", email: "", message: "" });
      } else {
        setContactState("error");
      }
    } catch {
      setContactState("error");
    }
  }

  const contactModal = showContact ? (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowContact(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md bg-background border border-border rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setShowContact(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close contact form"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mx-auto mb-3">
            <Mail className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold">Contact Us</h2>
          <p className="text-sm text-muted-foreground">Have a question or suggestion? We'd love to hear from you.</p>
        </div>

        {contactState === "sent" ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <CheckCircle className="h-10 w-10 text-primary" />
            <p className="text-base font-semibold">Message sent!</p>
            <p className="text-sm text-muted-foreground">Thanks for reaching out — we'll get back to you soon.</p>
            <button className="mt-2 text-sm text-primary underline underline-offset-2" onClick={() => setContactState("idle")}>Send another message</button>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nav-contact-name" className="text-sm font-medium">Name</label>
                <input id="nav-contact-name" type="text" required placeholder="Your name" value={contactForm.name} onChange={e => setContactForm(d => ({ ...d, name: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="nav-contact-email" className="text-sm font-medium">Email</label>
                <input id="nav-contact-email" type="email" required placeholder="your@email.com" value={contactForm.email} onChange={e => setContactForm(d => ({ ...d, email: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="nav-contact-message" className="text-sm font-medium">Message</label>
              <textarea id="nav-contact-message" required rows={4} placeholder="Write your message here..." value={contactForm.message} onChange={e => setContactForm(d => ({ ...d, message: e.target.value }))} className="rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition resize-none" />
            </div>
            {contactState === "error" && <p className="text-sm text-destructive">Something went wrong. Please try again.</p>}
            <Button type="submit" disabled={contactState === "sending"} className="self-end gap-2">
              {contactState === "sending" ? "Sending..." : "Send Message"} <Mail className="h-4 w-4" />
            </Button>
          </form>
        )}
      </div>
    </div>
  ) : null;

  return (
    <>
      {header}
      {contactModal}
    </>
  );
}
