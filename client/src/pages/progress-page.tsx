import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Unit, type Lesson, type UserProgress } from "@shared/schema";
import { unitColors } from "@/lib/curriculum";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, CheckCircle2, Trophy, Flame, Target, ChevronRight,
  Layers, Shuffle, RotateCcw, XCircle, ChevronLeft
} from "lucide-react";

// ─── Flashcard types & helpers ───────────────────────────────────────────────
interface FlashCard {
  id: string;
  gurmukhi: string;
  romanized: string;
  english: string;
  unit: string;
  unitColor: string;
}

const UNIT_BADGE: Record<string, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  teal: "bg-teal-500",
  orange: "bg-orange-500",
};

const UNIT_CARD_BG: Record<string, string> = {
  amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800",
  emerald: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800",
  blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800",
  teal: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800",
  orange: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
};

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Main Progress Page ───────────────────────────────────────────────────────
export default function ProgressPage() {
  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({ queryKey: ["/api/units"] });
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery<Lesson[]>({ queryKey: ["/api/lessons"] });
  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress[]>({ queryKey: ["/api/progress"] });

  const completedLessons = progress?.filter(p => p.completed) || [];
  const totalScore = completedLessons.reduce((sum, p) => sum + p.score, 0);
  const uniqueLessonsCompleted = new Set(completedLessons.map(p => p.lessonId)).size;

  const lastAccessDates = [...new Set(
    (progress || [])
      .filter(p => p.lastAccessed)
      .map(p => p.lastAccessed.split("T")[0])
  )].sort().reverse();

  let streak = 0;
  if (lastAccessDates.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    if (lastAccessDates[0] === today || lastAccessDates[0] === getYesterday()) {
      streak = 1;
      for (let i = 1; i < lastAccessDates.length; i++) {
        const expected = new Date(lastAccessDates[i - 1]);
        expected.setDate(expected.getDate() - 1);
        if (lastAccessDates[i] === expected.toISOString().split("T")[0]) streak++;
        else break;
      }
    }
  }

  const isLoading = unitsLoading || progressLoading || lessonsLoading;

  if (isLoading) {
    return (
      <div className="page-enter mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <Skeleton className="h-7 w-48 mb-8" />
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1" data-testid="text-progress-title">Your Progress</h1>
        <p className="text-sm text-muted-foreground">Track your Punjabi learning journey</p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-10">
        <div className="p-5 rounded-xl border border-border/60 bg-card" data-testid="card-stat-completed">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Lessons Completed</span>
          </div>
          <p className="text-2xl font-bold">{uniqueLessonsCompleted}</p>
        </div>

        <div className="p-5 rounded-xl border border-border/60 bg-card" data-testid="card-stat-score">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center">
              <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Total Score</span>
          </div>
          <p className="text-2xl font-bold">{totalScore}</p>
        </div>

        <div className="p-5 rounded-xl border border-border/60 bg-card" data-testid="card-stat-streak">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center">
              <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Day Streak</span>
          </div>
          <p className="text-2xl font-bold">{streak}</p>
        </div>
      </div>

      {/* Unit progress breakdown */}
      <h2 className="text-base font-bold mb-4" data-testid="text-unit-progress">Progress by Unit</h2>
      <div className="space-y-4 mb-12">
        {units?.map(unit => (
          <UnitProgressCard key={unit.id} unit={unit} progress={progress || []} />
        ))}
      </div>

      {/* Empty state */}
      {uniqueLessonsCompleted === 0 && (
        <div className="text-center py-8 mb-10">
          <Target className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold mb-1">No progress yet</h3>
          <p className="text-xs text-muted-foreground mb-4">Start your first lesson to begin tracking your progress.</p>
          <Link href="/learn">
            <Button data-testid="button-start-first-lesson">Start Learning</Button>
          </Link>
        </div>
      )}

      {/* ── Flashcards Section ── */}
      <FlashcardsSection units={units || []} lessons={lessons as any[]} />
    </div>
  );
}

// ─── Unit Progress Card ───────────────────────────────────────────────────────
function UnitProgressCard({ unit, progress }: { unit: Unit; progress: UserProgress[] }) {
  const { data: lessons } = useQuery<Lesson[]>({ queryKey: ["/api/units", unit.id, "lessons"] });
  const completedInUnit = lessons?.filter(l =>
    progress.some(p => p.lessonId === l.id && p.completed)
  ).length || 0;
  const totalInUnit = lessons?.length || 0;
  const percent = totalInUnit > 0 ? Math.round((completedInUnit / totalInUnit) * 100) : 0;
  const colors = unitColors[unit.color] || unitColors.amber;

  return (
    <Link href={`/learn/${unit.id}`}>
      <div
        className="group flex items-center gap-4 p-4 rounded-xl border border-border/60 bg-card cursor-pointer transition-all duration-200 hover:border-primary/30"
        data-testid={`card-progress-unit-${unit.id}`}
      >
        <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colors.accent} flex items-center justify-center`}>
          <BookOpen className={`h-5 w-5 ${colors.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-semibold truncate">{unit.title}</h3>
            <span className="text-xs text-muted-foreground ml-2">{completedInUnit}/{totalInUnit}</span>
          </div>
          <Progress value={percent} className="h-1.5" />
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

// ─── Flashcards Section ───────────────────────────────────────────────────────
function FlashcardsSection({ units, lessons }: { units: any[]; lessons: any[] }) {
  const [filterUnit, setFilterUnit] = useState("all");
  const [deck, setDeck] = useState<FlashCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unsure, setUnsure] = useState<Set<string>>(new Set());
  const [sessionDone, setSessionDone] = useState(false);

  // Build cards from lesson content
  const allCards: FlashCard[] = [];
  for (const lesson of lessons) {
    const unit = units.find((u: any) => u.id === lesson.unit_id);
    if (!unit) continue;
    let content: any = {};
    try { content = typeof lesson.content === "string" ? JSON.parse(lesson.content) : lesson.content; } catch {}
    if (Array.isArray(content?.items)) {
      for (const item of content.items) {
        if (item.gurmukhi && item.english) {
          allCards.push({
            id: `${lesson.id}-${item.gurmukhi}`,
            gurmukhi: item.gurmukhi,
            romanized: item.romanized ?? "",
            english: item.english,
            unit: unit.title,
            unitColor: unit.color ?? "blue",
          });
        }
      }
    }
  }

  const unitNames = Array.from(new Set(allCards.map(c => c.unit)));
  const filtered = filterUnit === "all" ? allCards : allCards.filter(c => c.unit === filterUnit);

  useEffect(() => {
    setDeck(shuffleArr(filtered));
    setIndex(0); setFlipped(false);
    setKnown(new Set()); setUnsure(new Set()); setSessionDone(false);
  }, [filterUnit, lessons.length]);

  const card = deck[index];
  const progress = deck.length > 0 ? Math.round(((known.size + unsure.size) / deck.length) * 100) : 0;

  function next() {
    setFlipped(false);
    setTimeout(() => {
      if (index + 1 >= deck.length) setSessionDone(true);
      else setIndex(i => i + 1);
    }, 150);
  }
  function markKnown() { if (!card) return; setKnown(s => new Set([...s, card.id])); next(); }
  function markUnsure() { if (!card) return; setUnsure(s => new Set([...s, card.id])); next(); }
  function restart() {
    const rem = unsure.size > 0 ? deck.filter(c => unsure.has(c.id)) : shuffleArr(filtered);
    setDeck(rem.length > 0 ? rem : shuffleArr(filtered));
    setIndex(0); setFlipped(false); setKnown(new Set()); setUnsure(new Set()); setSessionDone(false);
  }
  function reshuffle() {
    setDeck(shuffleArr(filtered)); setIndex(0); setFlipped(false);
    setKnown(new Set()); setUnsure(new Set()); setSessionDone(false);
  }

  if (allCards.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-4 w-4 text-primary" />
        <h2 className="text-base font-bold">Flashcards</h2>
        <span className="text-xs text-muted-foreground">{allCards.length} cards</span>
      </div>

      {/* Unit filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilterUnit("all")}
          className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
            filterUnit === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary"
          }`}
        >All ({allCards.length})</button>
        {unitNames.map(u => {
          const uo = units.find((uu: any) => uu.title === u);
          const col = uo?.color ?? "blue";
          const count = allCards.filter(c => c.unit === u).length;
          return (
            <button key={u} onClick={() => setFilterUnit(u)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                filterUnit === u ? `${UNIT_BADGE[col] ?? "bg-primary"} text-white border-transparent` : "bg-muted text-muted-foreground border-border hover:border-primary"
              }`}
            >{u.split(" ")[0]} ({count})</button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{Math.min(index + 1, deck.length)} / {deck.length}</span>
          <span className="flex gap-3">
            <span className="text-emerald-600 dark:text-emerald-400">✓ {known.size} known</span>
            <span className="text-amber-600 dark:text-amber-400">? {unsure.size} review</span>
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>

      <AnimatePresence mode="wait">
        {sessionDone ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="text-center py-12 rounded-2xl border border-border/60 bg-card"
          >
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-bold mb-1">Session Complete!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="text-emerald-600 font-semibold">{known.size} known</span> · <span className="text-amber-600 font-semibold">{unsure.size} to review</span>
            </p>
            <div className="flex gap-3 justify-center">
              {unsure.size > 0 && (
                <Button onClick={restart} size="sm"><RotateCcw className="w-3.5 h-3.5 mr-1" /> Review {unsure.size}</Button>
              )}
              <Button onClick={reshuffle} variant="outline" size="sm"><Shuffle className="w-3.5 h-3.5 mr-1" /> Start fresh</Button>
            </div>
          </motion.div>
        ) : card ? (
          <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Card */}
            <div className="cursor-pointer select-none" style={{ perspective: "1200px" }} onClick={() => setFlipped(f => !f)}>
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                style={{ transformStyle: "preserve-3d", position: "relative", minHeight: "220px" }}
              >
                {/* Front */}
                <div
                  className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center p-6 ${
                    UNIT_CARD_BG[card.unitColor] ?? UNIT_CARD_BG.blue
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <Badge variant="outline" className="mb-3 text-xs">{card.unit}</Badge>
                  <p className="text-5xl font-bold mb-2" style={{ fontFamily: "'Noto Sans Gurmukhi', serif" }}>{card.gurmukhi}</p>
                  {card.romanized && <p className="text-base text-muted-foreground">{card.romanized}</p>}
                  <p className="text-xs text-muted-foreground mt-4">Tap to reveal</p>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl border-2 border-primary/30 bg-primary/5 flex flex-col items-center justify-center p-6"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <Badge className={`mb-3 text-xs ${UNIT_BADGE[card.unitColor] ?? "bg-primary"}`}>{card.unit}</Badge>
                  <p className="text-4xl font-bold mb-1" style={{ fontFamily: "'Noto Sans Gurmukhi', serif" }}>{card.gurmukhi}</p>
                  {card.romanized && <p className="text-sm text-muted-foreground mb-3">{card.romanized}</p>}
                  <p className="text-xl font-semibold text-primary text-center">{card.english}</p>
                </div>
              </motion.div>
            </div>

            {/* Know it / Still learning */}
            <div className="flex gap-3 mt-4 justify-center">
              <Button variant="outline" size="sm" onClick={markUnsure}
                className="flex-1 max-w-[160px] border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20">
                <XCircle className="w-3.5 h-3.5 mr-1" /> Still learning
              </Button>
              <Button variant="outline" size="sm" onClick={markKnown}
                className="flex-1 max-w-[160px] border-emerald-400 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Got it!
              </Button>
            </div>

            {/* Prev / Reshuffle / Skip */}
            <div className="flex items-center justify-between mt-3">
              <Button variant="ghost" size="sm" disabled={index === 0}
                onClick={() => { setFlipped(false); setTimeout(() => setIndex(i => Math.max(0, i - 1)), 150); }}>
                <ChevronLeft className="w-4 h-4" /> Prev
              </Button>
              <Button variant="ghost" size="sm" onClick={reshuffle}>
                <Shuffle className="w-3.5 h-3.5 mr-1" /> Reshuffle
              </Button>
              <Button variant="ghost" size="sm" onClick={next}>
                Skip <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}
