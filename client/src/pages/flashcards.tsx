import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Shuffle, BookOpen, CheckCircle2, XCircle, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface FlashCard {
  id: string;
  gurmukhi: string;
  romanized: string;
  english: string;
  unit: string;
  unitColor: string;
}

const UNIT_COLORS: Record<string, string> = {
  amber: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700",
  emerald: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700",
  blue: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
  purple: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
  teal: "bg-teal-100 dark:bg-teal-900/30 border-teal-300 dark:border-teal-700",
  orange: "bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700",
};

const UNIT_BADGE: Record<string, string> = {
  amber: "bg-amber-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  teal: "bg-teal-500",
  orange: "bg-orange-500",
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardsPage() {
  const [deck, setDeck] = useState<FlashCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unsure, setUnsure] = useState<Set<string>>(new Set());
  const [filterUnit, setFilterUnit] = useState<string>("all");
  const [sessionDone, setSessionDone] = useState(false);

  const { data: units = [] } = useQuery<any[]>({ queryKey: ["/api/units"] });
  const { data: lessons = [] } = useQuery<any[]>({ queryKey: ["/api/lessons"] });

  // Build all flashcards from lesson content
  const allCards: FlashCard[] = [];
  for (const lesson of lessons as any[]) {
    const unit = (units as any[]).find((u: any) => u.id === lesson.unit_id);
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
    setDeck(shuffle(filtered));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnsure(new Set());
    setSessionDone(false);
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

  function markKnown() {
    if (!card) return;
    setKnown(s => new Set([...s, card.id]));
    next();
  }

  function markUnsure() {
    if (!card) return;
    setUnsure(s => new Set([...s, card.id]));
    next();
  }

  function restart() {
    const remaining = unsure.size > 0 ? deck.filter(c => unsure.has(c.id)) : shuffle(filtered);
    setDeck(remaining.length > 0 ? remaining : shuffle(filtered));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnsure(new Set());
    setSessionDone(false);
  }

  function reshuffleFull() {
    setDeck(shuffle(filtered));
    setIndex(0);
    setFlipped(false);
    setKnown(new Set());
    setUnsure(new Set());
    setSessionDone(false);
  }

  if (allCards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading flashcards…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">Flashcards</h1>
          </div>
          <p className="text-sm text-muted-foreground">{allCards.length} cards across all units</p>
        </div>

        {/* Unit filter */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <button
            onClick={() => setFilterUnit("all")}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              filterUnit === "all"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted text-muted-foreground border-border hover:border-primary"
            }`}
          >
            All ({allCards.length})
          </button>
          {unitNames.map(u => {
            const unitObj = (units as any[]).find((uu: any) => uu.title === u);
            const col = unitObj?.color ?? "blue";
            const count = allCards.filter(c => c.unit === u).length;
            return (
              <button
                key={u}
                onClick={() => setFilterUnit(u)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  filterUnit === u
                    ? `${UNIT_BADGE[col] ?? "bg-primary"} text-white border-transparent`
                    : "bg-muted text-muted-foreground border-border hover:border-primary"
                }`}
              >
                {u.split(" ")[0]} ({count})
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{index + 1} / {deck.length}</span>
            <span className="flex gap-3">
              <span className="text-emerald-600 dark:text-emerald-400">✓ {known.size} known</span>
              <span className="text-amber-600 dark:text-amber-400">? {unsure.size} review</span>
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Session complete */}
        <AnimatePresence mode="wait">
          {sessionDone ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
              <p className="text-muted-foreground mb-2">
                <span className="text-emerald-600 font-semibold">{known.size} known</span> · <span className="text-amber-600 font-semibold">{unsure.size} to review</span>
              </p>
              {unsure.size > 0 && (
                <p className="text-sm text-muted-foreground mb-6">Practice the {unsure.size} tricky cards again?</p>
              )}
              <div className="flex gap-3 justify-center">
                {unsure.size > 0 && (
                  <Button onClick={restart} variant="default">
                    <RotateCcw className="w-4 h-4 mr-1" /> Review {unsure.size} cards
                  </Button>
                )}
                <Button onClick={reshuffleFull} variant="outline">
                  <Shuffle className="w-4 h-4 mr-1" /> Start fresh
                </Button>
              </div>
            </motion.div>
          ) : card ? (
            <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* The flashcard */}
              <div
                className="cursor-pointer select-none"
                style={{ perspective: "1200px" }}
                onClick={() => setFlipped(f => !f)}
              >
                <motion.div
                  animate={{ rotateY: flipped ? 180 : 0 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformStyle: "preserve-3d", position: "relative", minHeight: "260px" }}
                >
                  {/* Front */}
                  <div
                    className={`absolute inset-0 rounded-2xl border-2 flex flex-col items-center justify-center p-8 ${
                      UNIT_COLORS[card.unitColor] ?? UNIT_COLORS.blue
                    }`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <Badge variant="outline" className="mb-4 text-xs">{card.unit}</Badge>
                    <p className="text-6xl font-bold mb-3" style={{ fontFamily: "serif" }}>{card.gurmukhi}</p>
                    {card.romanized && (
                      <p className="text-lg text-muted-foreground font-medium">{card.romanized}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-6">Tap to reveal</p>
                  </div>
                  {/* Back */}
                  <div
                    className="absolute inset-0 rounded-2xl border-2 border-primary/30 bg-primary/5 flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  >
                    <Badge className="mb-4 text-xs bg-primary">{card.unit}</Badge>
                    <p className="text-4xl font-bold mb-2" style={{ fontFamily: "serif" }}>{card.gurmukhi}</p>
                    {card.romanized && <p className="text-base text-muted-foreground mb-4">{card.romanized}</p>}
                    <p className="text-2xl font-semibold text-primary text-center">{card.english}</p>
                  </div>
                </motion.div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={markUnsure}
                  className="flex-1 max-w-[180px] border-amber-400 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                >
                  <XCircle className="w-4 h-4 mr-2" /> Still learning
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={markKnown}
                  className="flex-1 max-w-[180px] border-emerald-400 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Got it!
                </Button>
              </div>

              {/* Nav */}
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={index === 0}
                  onClick={() => { setFlipped(false); setTimeout(() => setIndex(i => Math.max(0, i - 1)), 150); }}
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <Button variant="ghost" size="sm" onClick={reshuffleFull}>
                  <Shuffle className="w-4 h-4 mr-1" /> Reshuffle
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={next}
                >
                  Skip <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Stats footer */}
        {!sessionDone && (
          <div className="mt-8 p-4 rounded-xl bg-muted/50 text-center">
            <p className="text-xs text-muted-foreground">
              <BookOpen className="inline w-3 h-3 mr-1" />
              {deck.length} cards in this session · tap any card to flip
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
