import { Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { Sun, Moon, Menu, X, Sparkles, LogOut, LogIn } from "lucide-react";
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
  const [location] = useHashLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showTutorToast, setShowTutorToast] = useState(false);
  const { user, loading, signOut } = useAuth();

  const isLanding = location === "/" || location === "";
  const displayName = user?.user_metadata?.username || user?.email?.split("@")[0] || "You";

  const handleTutorClick = () => {
    setShowTutorToast(true);
    setTimeout(() => setShowTutorToast(false), 3000);
  };

  return (
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
            <Button size="icon" variant="ghost" onClick={toggle} data-testid="button-theme-toggle"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {!loading && (
              user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Hi, <span className="font-medium text-foreground">{displayName}</span></span>
                  <Button size="sm" variant="ghost" onClick={signOut} className="gap-1.5" data-testid="button-sign-out">
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="hidden sm:inline-flex gap-1.5" data-testid="button-sign-in">
                    <LogIn className="h-3.5 w-3.5" />
                    {isLanding ? "Start Learning" : "Sign in"}
                  </Button>
                </Link>
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
                  <Link href="/login">
                    <span onClick={() => setMobileOpen(false)}>
                      <Button size="sm" className="w-full mt-2" data-testid="button-mobile-sign-in">
                        <LogIn className="h-3.5 w-3.5 mr-1.5" />
                        Sign in / Register
                      </Button>
                    </span>
                  </Link>
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
}
