import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { type Unit, type Lesson } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Volume2, CheckCircle2, XCircle, RotateCcw, ChevronRight, Sparkles, BookOpen, Trophy, Layers, Shuffle } from "lucide-react";

/* ── Confetti burst helper ── */
function useConfetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<any[]>([]);
  const rafRef = useRef<number | null>(null);

  const burst = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const colors = ["#01696f", "#4f98a3", "#6daa45", "#e8af34", "#d163a7"];
    particlesRef.current = Array.from({ length: 36 }, () => ({
      x, y,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -12 - 4,
      r: Math.random() * 5 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
    }));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.05);
      particlesRef.current.forEach((p: any) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5;
        p.alpha -= 0.025;
        p.rotation += p.rotSpeed;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
        ctx.restore();
      });
      if (particlesRef.current.length > 0) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    animate();
  };

  return { canvasRef, burst };
}

/* ── Mixed Flashcard types ── */
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

/* ── static flashcard & quiz data ── */
const flashcardSets = [
  {
    title: "Essential Greetings",
    titlePunjabi: "ਜ਼ਰੂਰੀ ਸ਼ੁਭ ਇੱਛਾਵਾਂ",
    titleRomanized: "Zaruri Shubh Ichhavaan",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    cards: [
      { front: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", pronunciation: "Sat Sri Akal", back: "Hello", hint: "The most common Sikh greeting" },
      { front: "ਕਿਦਾਂ?", pronunciation: "Kidaan?", back: "How are you? (informal)", hint: "Use with friends and peers" },
      { front: "ਸ਼ੁਕਰੀਆ", pronunciation: "Shukriya", back: "Thank you", hint: "Used universally" },
      { front: "ਅਲਵਿਦਾ", pronunciation: "Alvida", back: "Goodbye", hint: "Formal farewell" },
      { front: "ਕਿਰਪਾ ਕਰਕੇ", pronunciation: "Kirpa karke", back: "Please", hint: "Shows politeness" },
      { front: "ਮਾਫ਼ ਕਰਨਾ", pronunciation: "Maaf karna", back: "Sorry / Excuse me", hint: "" },
    ],
  },
  {
    title: "Numbers 1-10",
    titlePunjabi: "ਅੰਕ ੧-੧੦",
    titleRomanized: "Ank 1-10",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    cards: [
      { front: "੧ — ਇੱਕ", pronunciation: "Ikk", back: "One", hint: "" },
      { front: "੨ — ਦੋ", pronunciation: "Do", back: "Two", hint: "" },
      { front: "੩ — ਤਿੰਨ", pronunciation: "Tinn", back: "Three", hint: "" },
      { front: "੪ — ਚਾਰ", pronunciation: "Chaar", back: "Four", hint: "" },
      { front: "੫ — ਪੰਜ", pronunciation: "Panj", back: "Five", hint: "Punjab = Land of 5 rivers" },
      { front: "੬ — ਛੇ", pronunciation: "Chhe", back: "Six", hint: "" },
      { front: "੭ — ਸੱਤ", pronunciation: "Satt", back: "Seven", hint: "" },
      { front: "੮ — ਅੱਠ", pronunciation: "Atth", back: "Eight", hint: "" },
      { front: "੯ — ਨੌਂ", pronunciation: "NauN", back: "Nine", hint: "" },
      { front: "੧੦ — ਦਸ", pronunciation: "Das", back: "Ten", hint: "" },
    ],
  },
  {
    title: "Family Members",
    titlePunjabi: "ਪਰਿਵਾਰਕ ਮੈਂਬਰ",
    titleRomanized: "Parivarak Member",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    cards: [
      { front: "ਮਾਂ", pronunciation: "Maa", back: "Mother", hint: "" },
      { front: "ਪਿਤਾ ਜੀ", pronunciation: "Pita ji", back: "Father (respectful)", hint: "'Ji' shows respect" },
      { front: "ਭੈਣ", pronunciation: "Bhain", back: "Sister", hint: "" },
      { front: "ਭਰਾ", pronunciation: "Bhra", back: "Brother", hint: "" },
      { front: "ਦਾਦੀ", pronunciation: "Daadi", back: "Paternal grandmother", hint: "Father's mother" },
      { front: "ਨਾਨੀ", pronunciation: "Naani", back: "Maternal grandmother", hint: "Mother's mother" },
    ],
  },
  {
    title: "Food & Drinks",
    titlePunjabi: "ਖਾਣਾ ਪੀਣਾ",
    titleRomanized: "Khaana Peena",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    cards: [
      { front: "ਰੋਟੀ", pronunciation: "Roti", back: "Flatbread / Chapati", hint: "Staple of every meal" },
      { front: "ਦਾਲ", pronunciation: "Daal", back: "Lentil curry", hint: "Daal roti = classic combo" },
      { front: "ਚਾਹ", pronunciation: "Chaah", back: "Tea", hint: "Punjabi chai culture" },
      { front: "ਪਾਣੀ", pronunciation: "Paani", back: "Water", hint: "" },
      { front: "ਲੱਸੀ", pronunciation: "Lassi", back: "Yogurt drink", hint: "Sweet or salted" },
      { front: "ਮੱਖਣ", pronunciation: "Makkhan", back: "Butter", hint: "" },
    ],
  },
];

const quizzes = [
  {
    question: "How do you say 'Hello' in Punjabi?",
    options: ["ਸ਼ੁਕਰੀਆ (Shukriya)", "ਸਤ ਸ੍ਰੀ ਅਕਾਲ (Sat Sri Akal)", "ਅਲਵਿਦਾ (Alvida)", "ਕਿਦਾਂ (Kidaan)"],
    correct: 1,
  },
  {
    question: "What does 'ਸ਼ੁਕਰੀਆ (Shukriya)' mean?",
    options: ["Goodbye", "Sorry", "Thank you", "Please"],
    correct: 2,
  },
  {
    question: "Which is the Punjabi number for 5?",
    options: ["ਤਿੰਨ (Tinn)", "ਪੰਜ (Panj)", "ਸੱਤ (Satt)", "ਦਸ (Das)"],
    correct: 1,
  },
  {
    question: "What does 'ਮਾਂ (Maa)' mean?",
    options: ["Father", "Sister", "Mother", "Grandmother"],
    correct: 2,
  },
  {
    question: "How do you ask 'How are you?' informally?",
    options: ["ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ? (Tusi kive ho?)", "ਕਿਦਾਂ? (Kidaan?)", "ਕਿੱਥੇ? (Kitthe?)", "ਕੀ ਹਾਲ ਹੈ? (Ki haal hai?)"],
    correct: 1,
  },
  {
    question: "What is 'ਦਾਲ (Daal)'?",
    options: ["Rice", "Bread", "Lentil curry", "Yogurt drink"],
    correct: 2,
  },
  {
    question: "What does 'ਜੀ (Ji)' signify when added to a name?",
    options: ["Anger", "Respect", "Question", "Farewell"],
    correct: 1,
  },
  {
    question: "Which Punjabi word means 'Water'?",
    options: ["ਚਾਹ (Chaah)", "ਦੁੱਧ (Duddh)", "ਲੱਸੀ (Lassi)", "ਪਾਣੀ (Paani)"],
    correct: 3,
  },
  {
    question: "What does 'ਭੈਣ (Bhain)' mean?",
    options: ["Brother", "Mother", "Sister", "Friend"],
    correct: 2,
  },
  {
    question: "How do you say 'Please' in Punjabi?",
    options: ["ਅਲਵਿਦਾ (Alvida)", "ਕਿਰਪਾ ਕਰਕੇ (Kirpa karke)", "ਮਾਫ਼ ਕਰਨਾ (Maaf karna)", "ਸ਼ੁਕਰੀਆ (Shukriya)"],
    correct: 1,
  },
];

/* ── Flashcard Mode ── */
function FlashcardDeck({ set, onBack }: { set: (typeof flashcardSets)[0]; onBack: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<number[]>([]);

  const card = set.cards[index];
  const total = set.cards.length;
  const progress = known.length;

  const next = (gotIt: boolean) => {
    if (gotIt && !known.includes(index)) setKnown((prev: number[]) => [...prev, index]);
    setFlipped(false);
    if (index < total - 1) {
      setIndex((i: number) => i + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setFlipped(false);
    setKnown([]);
  };

  const done = index === total - 1 && flipped;

  return (
    <div className="mx-auto max-w-xl">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors" data-testid="button-back-practice">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back to Practice
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">{set.title}</h2>
        <span className="text-xs text-muted-foreground">{index + 1} / {total}</span>
      </div>

      <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <div
        onClick={() => setFlipped(true)}
        className={`relative min-h-[220px] rounded-2xl border-2 cursor-pointer transition-all duration-200 flex flex-col items-center justify-center p-8 text-center ${
          flipped ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/30 bg-card"
        }`}
        data-testid="flashcard"
      >
        {!flipped ? (
          <>
            <p className="gurmukhi text-3xl sm:text-4xl font-bold mb-1">{card.front}</p>
            <p className="text-base font-semibold text-primary mb-3">{card.pronunciation}</p>
            <p className="text-xs text-muted-foreground">Tap to reveal meaning</p>
          </>
        ) : (
          <>
            <p className="gurmukhi text-2xl font-bold text-muted-foreground mb-0.5">{card.front}</p>
            <p className="text-sm font-semibold text-primary mb-2">{card.pronunciation}</p>
            <p className="text-xl font-bold text-foreground mb-1">{card.back}</p>
            {card.hint && <p className="text-xs text-muted-foreground mt-1">{card.hint}</p>}
          </>
        )}
      </div>

      {flipped && !done && (
        <div className="flex gap-3 mt-4">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => next(false)} data-testid="button-still-learning">
            <XCircle className="h-4 w-4" /> Still learning
          </Button>
          <Button className="flex-1 gap-2" onClick={() => next(true)} data-testid="button-got-it">
            <CheckCircle2 className="h-4 w-4" /> Got it
          </Button>
        </div>
      )}

      {done && (
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Trophy className="h-4 w-4" />
            {progress}Mastered {progress} / {total}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 gap-2" onClick={restart} data-testid="button-restart-cards">
              <RotateCcw className="h-4 w-4" /> Try again
            </Button>
            <Button className="flex-1 gap-2" onClick={onBack} data-testid="button-done-cards">
              <CheckCircle2 className="h-4 w-4" /> Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Quiz Mode ── */
function QuizMode({ onBack }: { onBack: () => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [finished, setFinished] = useState(false);
  const [correctAnim, setCorrectAnim] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { canvasRef, burst } = useConfetti();

  const q = quizzes[current];

  const handleSelect = (idx: number, e: React.MouseEvent) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correct) {
      setScore((s: number) => s + 1);
      setCorrectAnim(true);
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        burst(e.clientX - rect.left, e.clientY - rect.top);
      }
      setTimeout(() => setCorrectAnim(false), 800);
    }
  };

  const nextQ = () => {
    if (current < quizzes.length - 1) {
      setCurrent((c: number) => c + 1);
      setSelected(null);
      setAnswered(false);
      setCorrectAnim(false);
    } else {
      setFinished(true);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
    setCorrectAnim(false);
  };

  if (finished) {
    const pct = Math.round((score / quizzes.length) * 100);
    return (
      <div className="mx-auto max-w-xl text-center py-12">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Trophy className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-1">Quiz Complete</h2>
        <p className="text-3xl font-extrabold text-primary mb-1">{pct}%</p>
        <p className="text-sm text-muted-foreground mb-6">{score} out of {quizzes.length} correct</p>
        <div className="flex gap-3 max-w-xs mx-auto">
          <Button variant="outline" className="flex-1 gap-2" onClick={restart} data-testid="button-retake-quiz">
            <RotateCcw className="h-4 w-4" /> Retake
          </Button>
          <Button className="flex-1 gap-2" onClick={onBack} data-testid="button-done-quiz">
            <CheckCircle2 className="h-4 w-4" /> Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl relative" ref={containerRef}>
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 w-full h-full z-10" width={600} height={600} />
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back to Practice
      </button>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Quick Quiz</h2>
        <span className="text-xs text-muted-foreground">Question {current + 1} / {quizzes.length}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((current + 1) / quizzes.length) * 100}%` }} />
      </div>
      <p className="text-base font-semibold mb-6">{q.question}</p>
      <div className="space-y-3 mb-6">
        {q.options.map((opt, i) => {
          let cls = "border-border hover:border-primary/30 bg-card";
          let iconEl = null;
          if (answered) {
            if (i === q.correct) {
              cls = "border-green-500 bg-green-500/10 transition-all duration-300";
              iconEl = <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
            } else if (i === selected) {
              cls = "border-red-500 bg-red-500/10";
              iconEl = <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
            }
          }
          return (
            <button key={i} onClick={(e) => handleSelect(i, e)} className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium flex items-center justify-between gap-3 ${cls}`}>
              <span>{opt}</span>
              {iconEl}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${selected === q.correct ? "text-green-600" : "text-red-600"}`}>
            {selected === q.correct ? "✓ Correct!" : `✗ Answer: ${q.options[q.correct]}`}
          </span>
          <Button size="sm" onClick={nextQ}>
            {current < quizzes.length - 1 ? "Next" : "Finish"} <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Mixed Flashcard Mode ── */
function MixedFlashcardMode({ cards, units, onBack, initialFilter = "all" }: { cards: FlashCard[]; units: Unit[]; onBack: () => void; initialFilter?: string }) {
  const [filterUnit, setFilterUnit] = useState(initialFilter);
  const [deck, setDeck] = useState<FlashCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Set<string>>(new Set());
  const [unsure, setUnsure] = useState<Set<string>>(new Set());
  const [sessionDone, setSessionDone] = useState(false);

  const unitNames = useMemo(() => Array.from(new Set(cards.map(c => c.unit))), [cards]);
  const filtered = useMemo(() => filterUnit === "all" ? cards : cards.filter(c => c.unit === filterUnit), [cards, filterUnit]);

  useEffect(() => {
    setDeck(shuffleArr(filtered));
    setIndex(0); setFlipped(false);
    setKnown(new Set([])); setUnsure(new Set([])); setSessionDone(false);
  }, [filtered]);

  const card = deck[index];
  const progressPct = deck.length > 0 ? Math.round(((known.size + unsure.size) / deck.length) * 100) : 0;

  function next() {
    setFlipped(false);
    setTimeout(() => {
      if (index + 1 >= deck.length) setSessionDone(true);
      else setIndex((i: number) => i + 1);
    }, 150);
  }

  function markKnown() { if (!card) return; setKnown((s: Set<string>) => new Set([...Array.from(s), card.id])); next(); }
  function markUnsure() { if (!card) return; setUnsure((s: Set<string>) => new Set([...Array.from(s), card.id])); next(); }
  
  function restart() {
    const rem = unsure.size > 0 ? deck.filter((c: FlashCard) => unsure.has(c.id)) : shuffleArr(filtered);
    setDeck(rem.length > 0 ? rem : shuffleArr(filtered));
    setIndex(0); setFlipped(false); setKnown(new Set([])); setUnsure(new Set([])); setSessionDone(false);
  }
  
  function reshuffle() {
    setDeck(shuffleArr(filtered));
    setIndex(0); setFlipped(false); setKnown(new Set([])); setUnsure(new Set([])); setSessionDone(false);
  }

  return (
    <div className="mx-auto max-w-xl">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back to Practice
      </button>

      <div className="flex items-center gap-2 mb-4">
        <Layers className="h-4 w-4 text-primary" />
        <h2 className="text-base font-bold tracking-tight">Mixed Flashcards</h2>
        <span className="text-xs text-muted-foreground font-medium ml-auto">{cards.length} total</span>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilterUnit("all")}
          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
            filterUnit === "all" ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border hover:border-primary"
          }`}
        >All</button>
        {unitNames.map((u: string) => {
          const uo = units.find((uu: Unit) => uu.title === u);
          const col = uo?.color ?? "blue";
          return (
            <button key={u} onClick={() => setFilterUnit(u)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                filterUnit === u ? `${UNIT_BADGE[col] ?? "bg-primary"} text-white border-transparent` : "bg-muted text-muted-foreground border-border hover:border-primary"
              }`}
            >{u.split(" ")[0]}</button>
          );
        })}
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          <span>{Math.min(index + 1, deck.length)} / {deck.length}</span>
          <div className="flex gap-4">
            <span className="text-emerald-600">✓ {known.size}</span>
            <span className="text-amber-600">? {unsure.size}</span>
          </div>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {sessionDone ? (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-12 px-6 rounded-3xl border-2 border-border/60 bg-card">
            <div className="text-3xl mb-4">🎉</div>
            <h3 className="text-lg font-bold mb-1">Session Complete!</h3>
            <p className="text-sm text-muted-foreground mb-8">{known.size} known · {unsure.size} review</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={restart} className="flex-1">Restart</Button>
              <Button onClick={reshuffle} className="flex-1">Shuffle All</Button>
            </div>
          </motion.div>
        ) : card ? (
          <motion.div key={card.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div onClick={() => setFlipped((f: boolean) => !f)} className={`cursor-pointer rounded-3xl border-2 p-10 text-center min-h-[240px] flex flex-col items-center justify-center gap-4 transition-all ${UNIT_CARD_BG[card.unitColor] ?? "bg-card"}`}>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase text-white ${UNIT_BADGE[card.unitColor] ?? "bg-primary"}`}>{card.unit}</span>
              {!flipped ? (
                <>
                  <p className="text-5xl font-bold gurmukhi">{card.gurmukhi}</p>
                  <p className="text-xl text-primary italic">{card.romanized}</p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold">{card.english}</p>
                  <p className="text-base text-primary/80 italic">{card.romanized}</p>
                  <p className="text-xs gurmukhi">{card.gurmukhi}</p>
                </>
              )}
            </div>
            {flipped && (
              <div className="flex gap-4 mt-6">
                <Button variant="outline" onClick={markUnsure} className="flex-1">Review</Button>
                <Button onClick={markKnown} className="flex-1">Got it!</Button>
              </div>
            )}
            <button onClick={next} className="w-full mt-4 text-xs text-muted-foreground">Skip</button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* ── Practice Home ── */
type Mode = "home" | "quiz" | { type: "flashcards"; setIndex: number } | "mixed";

export default function Practice() {
  const [mode, setMode] = useState<Mode>("home");
  const [initialFilter, setInitialFilter] = useState("all");
  const { data: units = [] } = useQuery<Unit[]>({ queryKey: ["/api/units"] });
  const { data: lessons = [] } = useQuery<Lesson[]>({ queryKey: ["/api/lessons"] });

  const allCards = useMemo(() => {
    const cards: FlashCard[] = [];
    for (const lesson of lessons) {
      const unit = units.find((u: Unit) => u.id === lesson.unitId);
      if (!unit) continue;
      let content: any = {};
      try {
        content = typeof lesson.content === "string" ? JSON.parse(lesson.content) : lesson.content;
      } catch (e) {}
      if (Array.isArray(content?.items)) {
        for (const item of content.items) {
          if (item.gurmukhi && item.english) {
            cards.push({
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
    return cards;
  }, [lessons, units]);

  if (mode === "quiz") return <div className="page-enter mx-auto max-w-6xl px-4 py-12"><QuizMode onBack={() => setMode("home")} /></div>;
  if (mode === "mixed") return <div className="page-enter mx-auto max-w-6xl px-4 py-12"><MixedFlashcardMode cards={allCards} units={units} onBack={() => setMode("home")} initialFilter={initialFilter} /></div>;
  if (typeof mode === "object" && mode.type === "flashcards") return <div className="page-enter mx-auto max-w-6xl px-4 py-12"><FlashcardDeck set={flashcardSets[mode.setIndex]} onBack={() => setMode("home")} /></div>;

  return (
    <div className="page-enter mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1">Practice</h1>
        <p className="text-sm text-muted-foreground">Reinforce your learning with flashcards and quizzes.</p>
      </div>

      <button onClick={() => setMode("quiz")} className="w-full text-left mb-8 group">
        <div className="rounded-2xl bg-primary p-8 flex items-center gap-4 transition-all group-hover:shadow-lg">
          <Dumbbell className="h-6 w-6 text-primary-foreground" />
          <div className="flex-1 text-primary-foreground">
            <h2 className="text-base font-bold">Quick Quiz</h2>
            <p className="text-sm opacity-80">Test your knowledge across all topics</p>
          </div>
          <ChevronRight className="h-5 w-5 text-primary-foreground/60" />
        </div>
      </button>

      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-1 flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Mastery Mode</h2>
        <p className="text-xs text-muted-foreground mb-4">Study a mix of all words from all your lessons at once</p>
      </div>

      <button onClick={() => setMode("mixed")} className="w-full text-left mb-10 group">
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-8 flex items-center gap-4 transition-all group-hover:shadow-md">
          <Layers className="h-6 w-6 text-primary" />
          <div className="flex-1">
            <h2 className="text-base font-bold text-primary">Mixed Flashcards</h2>
            <p className="text-sm text-muted-foreground">{allCards.length} cards from all completed units</p>
          </div>
          <ChevronRight className="h-5 w-5 text-primary/40" />
        </div>
      </button>

      <div className="mb-6 mt-10">
        <h2 className="text-sm font-semibold mb-1 flex items-center gap-2"><Layers className="h-4 w-4 text-primary" /> Mastery Decks by Unit</h2>
        <p className="text-xs text-muted-foreground mb-4">Focus on vocabulary from a specific unit</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-10">
        {units?.map((unit) => {
          const unitCards = allCards.filter(c => c.unit === unit.title);
          if (unitCards.length === 0) return null;
          return (
            <button
              key={unit.id}
              onClick={() => {
                // We'll use the mixed mode but with a pre-filtered set
                setInitialFilter(unit.title);
                setMode("mixed");
              }}
              className="group text-left p-5 rounded-2xl border border-border bg-card transition-all hover:border-primary/30"
            >
              <div className="flex items-start justify-between mb-3">
                <Badge variant="secondary" className="text-xs">{unitCards.length} cards</Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <h3 className="text-sm font-semibold">{unit.title}</h3>
              <p className="text-xs text-muted-foreground">{unit.titlePunjabi}</p>
            </button>
          );
        })}
      </div>

      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-1 flex items-center gap-2"><BookOpen className="h-4 w-4 text-muted-foreground" />Static Decks</h2>
        <p className="text-xs text-muted-foreground mb-4">Focus on specific categories with curated sets</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {flashcardSets.map((set, i) => (
          <button key={set.title} onClick={() => setMode({ type: "flashcards", setIndex: i })} className="group text-left p-5 rounded-xl border border-border bg-card transition-all hover:border-primary/30">
            <div className="flex items-start justify-between mb-3">
              <Badge variant="secondary" className="text-xs">{set.cards.length} cards</Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h3 className="text-sm font-semibold">{set.title}</h3>
            <p className="text-xs text-primary/70 italic">{set.titleRomanized}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
