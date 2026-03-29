import { Link, useLocation } from "wouter";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useTheme } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navLinks = [
  { href: "/learn", label: "Learn" },
  { href: "/tutor", label: "AI Tutor" },
  { href: "/progress", label: "Progress" },
];

export function NavHeader() {
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = location === "/" || location === "";

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-label="ShabadPath logo">
                <rect x="2" y="2" width="28" height="28" rx="8" stroke="currentColor" strokeWidth="2" className="text-primary" />
                <text x="16" y="22" textAnchor="middle" className="gurmukhi" fill="currentColor" fontSize="16" fontWeight="700" style={{ fontFamily: "'Noto Sans Gurmukhi', sans-serif" }}>ਸ਼</text>
              </svg>
              <span className="text-base font-bold tracking-tight" data-testid="text-logo">ShabadPath</span>
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
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={toggle}
              data-testid="button-theme-toggle"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            {isLanding && (
              <Link href="/learn">
                <Button size="sm" className="hidden sm:inline-flex" data-testid="button-start-learning">
                  Start Learning
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              size="icon"
              variant="ghost"
              className="sm:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
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
                  <span
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      location.startsWith(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {link.label}
                  </span>
                </Link>
              ))}
              {isLanding && (
                <Link href="/learn">
                  <span onClick={() => setMobileOpen(false)}>
                    <Button size="sm" className="w-full mt-2" data-testid="button-mobile-start">
                      Start Learning
                    </Button>
                  </span>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
