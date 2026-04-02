import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Volume2, CheckCircle2, XCircle, RotateCcw, ChevronRight, Sparkles, BookOpen, Trophy } from "lucide-react";

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
      particlesRef.current.forEach(p => {
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
    if (gotIt && !known.includes(index)) setKnown(prev => [...prev, index]);
    setFlipped(false);
    if (index < total - 1) {
      setIndex(i => i + 1);
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
            {/* Gurmukhi script */}
            <p className="gurmukhi text-3xl sm:text-4xl font-bold mb-1">{card.front}</p>
            {/* Romanized pronunciation — always visible, not hidden behind flip */}
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
            {progress} / {total} cards mastered
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
      setScore(s => s + 1);
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
      setCurrent(c => c + 1);
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
      <div className="mx-auto max-w-xl">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors" data-testid="button-back-practice-quiz">
          <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back to Practice
        </button>
        <div className="text-center py-12">
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl relative" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full z-10"
        width={600}
        height={600}
      />

      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors" data-testid="button-back-practice-quiz">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back to Practice
      </button>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Quick Quiz</h2>
        <span className="text-xs text-muted-foreground">Question {current + 1} / {quizzes.length}</span>
      </div>

      <div className="h-1.5 bg-muted rounded-full mb-6 overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-300" style={{ width: `${((current + 1) / quizzes.length) * 100}%` }} />
      </div>

      <p className="text-base font-semibold mb-6" data-testid="text-quiz-question">{q.question}</p>

      <div className="space-y-3 mb-6">
        {q.options.map((opt, i) => {
          let cls = "border-border hover:border-primary/30 bg-card";
          let iconEl = null;
          if (answered) {
            if (i === q.correct) {
              cls = `border-green-500 bg-green-500/10 ${
                correctAnim && i === selected ? "scale-[1.03] shadow-md shadow-green-500/20" : ""
              } transition-all duration-300`;
              iconEl = <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />;
            } else if (i === selected) {
              cls = "border-red-500 bg-red-500/10";
              iconEl = <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
            }
          }
          // Split "ਗੁਰਮੁਖੀ (Romanized)" into two lines
          const parenMatch = opt.match(/^(.+?)\s*\((.+?)\)$/);
          return (
            <button
              key={i}
              onClick={(e) => handleSelect(i, e)}
              className={`w-full text-left p-4 rounded-xl border-2 text-sm font-medium transition-all flex items-center justify-between gap-3 ${cls} ${!answered ? "cursor-pointer" : "cursor-default"}`}
              data-testid={`button-quiz-option-${i}`}
            >
              {parenMatch ? (
                <span className="flex flex-col gap-0.5">
                  <span className="gurmukhi text-sm font-semibold">{parenMatch[1].trim()}</span>
                  <span className="text-xs text-primary/80 font-medium italic">{parenMatch[2].trim()}</span>
                </span>
              ) : (
                <span>{opt}</span>
              )}
              {iconEl}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${
            selected === q.correct
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}>
            {selected === q.correct ? "✓ Correct!" : `✗ Answer: ${q.options[q.correct]}`}
          </span>
          <Button size="sm" onClick={nextQ} data-testid="button-quiz-next">
            {current < quizzes.length - 1 ? "Next" : "Finish"} <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Practice Home ── */
type Mode = "home" | "quiz" | { type: "flashcards"; setIndex: number };

export default function Practice() {
  const [mode, setMode] = useState<Mode>("home");

  if (mode === "quiz") {
    return (
      <div className="page-enter mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <QuizMode onBack={() => setMode("home")} />
      </div>
    );
  }

  if (typeof mode === "object" && mode.type === "flashcards") {
    return (
      <div className="page-enter mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <FlashcardDeck set={flashcardSets[mode.setIndex]} onBack={() => setMode("home")} />
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1" data-testid="text-practice-title">Practice</h1>
        <p className="text-sm text-muted-foreground">Reinforce what you've learned with flashcards and quizzes. Every Gurmukhi word shows its <span className="text-primary font-medium">romanised pronunciation</span> — no prior reading knowledge needed.</p>
      </div>

      <button
        onClick={() => setMode("quiz")}
        className="w-full text-left mb-8 group"
        data-testid="button-start-quiz"
      >
        <div className="relative rounded-2xl bg-primary p-6 sm:p-8 overflow-hidden transition-all duration-200 group-hover:shadow-lg">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-bold text-primary-foreground mb-0.5">Quick Quiz</h2>
              <p className="text-sm text-primary-foreground/80">{quizzes.length} questions across all topics — test your Punjabi knowledge</p>
            </div>
            <ChevronRight className="h-5 w-5 text-primary-foreground/60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="absolute -right-8 -bottom-8 opacity-10 gurmukhi text-[120px] font-bold pointer-events-none select-none" aria-hidden="true">ੴ</div>
        </div>
      </button>

      <div className="mb-6">
        <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          Flashcard Decks
        </h2>
        <p className="text-xs text-muted-foreground mb-4">Each card shows the Gurmukhi script with its romanised pronunciation below — tap to reveal the English meaning</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {flashcardSets.map((set, i) => (
          <button
            key={set.title}
            onClick={() => setMode({ type: "flashcards", setIndex: i })}
            className="group text-left p-5 rounded-xl border border-border/60 bg-card transition-all duration-200 hover:border-primary/30 cursor-pointer"
            data-testid={`card-flashcard-set-${i}`}
          >
            <div className="flex items-start justify-between mb-3">
              <Badge variant="secondary" className={`text-xs ${set.color}`}>
                {set.cards.length} cards
              </Badge>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
            </div>
            <h3 className="text-sm font-semibold mb-0.5">{set.title}</h3>
            {/* Show Gurmukhi + romanized side by side */}
            <p className="gurmukhi text-xs text-muted-foreground">{set.titlePunjabi}</p>
            <p className="text-xs text-primary/70 italic">{set.titleRomanized}</p>
          </button>
        ))}
      </div>

      <div className="mt-10 rounded-xl border border-dashed border-border/80 bg-muted/30 p-6 text-center">
        <Sparkles className="h-6 w-6 text-primary/60 mx-auto mb-3" />
        <h3 className="text-sm font-semibold mb-1">More practice modes coming soon</h3>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Listening exercises, pronunciation practice, and sentence building are on the way.
        </p>
      </div>
    </div>
  );
}
