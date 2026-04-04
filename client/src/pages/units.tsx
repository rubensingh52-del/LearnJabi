import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { type Unit, type UserProgress } from "@shared/schema";
import { unitColors } from "@/lib/curriculum";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  PenTool, HandMetal, Hash, Users, Utensils, MapPin,
  ChevronRight, BookOpen, Palette, Heart, Smile, Compass, Lock
} from "lucide-react";

const iconMap: Record<string, any> = {
  "pen-tool": PenTool,
  "hand-metal": HandMetal,
  "hash": Hash,
  "users": Users,
  "utensils": Utensils,
  "map-pin": MapPin,
  "palette": Palette,
  "heart": Heart,
  "smile": Smile,
  "compass": Compass,
  "book-open": BookOpen,
};

export default function Units() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({ queryKey: ["/api/units"] });
  // Only fetch progress when logged in — prevents a 401 for guests
  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

  const completedLessons = new Set(progress?.filter(p => p.completed).map(p => p.lessonId) || []);

  return (
    <div className="page-enter mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-6">
        <h1 className="text-xl font-bold mb-1" data-testid="text-units-title">Your Learning Path</h1>
        <p className="text-sm text-muted-foreground mb-4">Choose a unit to explore lessons, vocabulary, and exercises</p>
        <Link href="/alphabet">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-accent transition-all duration-200 cursor-pointer text-sm font-medium">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Gurmukhi Alphabet Reference</span>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </Link>
      </div>

      {unitsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="p-5 rounded-xl border border-border">
              <Skeleton className="h-10 w-10 rounded-lg mb-4" />
              <Skeleton className="h-5 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units?.map((unit) => {
              const colors = unitColors[unit.color] || unitColors.amber;
              const Icon = iconMap[unit.icon] || BookOpen;
              const isFree = unit.order === 1;
              const isLocked = !user && !isFree;

              if (isLocked) {
                return (
                  <div
                    key={unit.id}
                    onClick={() => navigate("/login")}
                    className="group relative p-5 rounded-xl border border-border/40 bg-muted/20 opacity-70 cursor-pointer hover:opacity-90 hover:border-primary/20 transition-all duration-200"
                    data-testid={`card-unit-${unit.id}-locked`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>Unit {unit.order}</span>
                        <Lock className="h-3 w-3" />
                      </div>
                    </div>
                    <h2 className="text-sm font-semibold mb-0.5 text-muted-foreground">{unit.title}</h2>
                    <p className="gurmukhi text-xs text-muted-foreground mb-2">{unit.titlePunjabi}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{unit.description}</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-xs text-primary font-medium">
                      <Lock className="h-3 w-3" /> Sign in to unlock
                    </div>
                  </div>
                );
              }

              return (
                <Link key={unit.id} href={`/learn/${unit.id}`}>
                  <div
                    className="group relative p-5 rounded-xl border border-border/60 bg-card transition-all duration-200 hover:border-primary/30 cursor-pointer"
                    data-testid={`card-unit-${unit.id}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-10 h-10 rounded-lg ${colors.accent} flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${colors.text}`} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span>Unit {unit.order}</span>
                        <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                    <h2 className="text-sm font-semibold mb-0.5" data-testid={`text-unit-title-${unit.id}`}>{unit.title}</h2>
                    <p className="gurmukhi text-xs text-muted-foreground mb-2">{unit.titlePunjabi}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{unit.description}</p>
                    {isFree && !user && (
                      <div className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> Free preview
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Login nudge for guests */}
          {!user && (
            <div className="mt-8 rounded-xl border border-primary/20 bg-primary/5 p-5 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <Lock className="h-8 w-8 text-primary flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-0.5">Units 2–8 are locked</h3>
                <p className="text-xs text-muted-foreground">Create a free account to unlock all units, track your progress, and practise with flashcards.</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href="/login"><Button size="sm" variant="outline">Sign in</Button></Link>
                <Link href="/register"><Button size="sm">Sign up free</Button></Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
