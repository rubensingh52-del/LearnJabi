import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { type Lesson, type Unit } from "@shared/schema";
import { type LessonContent, type Exercise } from "@/lib/curriculum";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { speakPunjabi } from "@/lib/tts";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw, Trophy, Volume2 } from "lucide-react";
import { useState, useMemo, useCallback, useRef } from "react";

type LessonStep = "learn" | "exercise" | "complete";

export default function LessonPage() {
  const params = useParams<{ unitId: string; lessonId: string }>();
  const [, navigate] = useLocation();
  const unitId = parseInt(params.unitId || "1");
  const lessonId = parseInt(params.lessonId || "1");

  const { data: lesson, isLoading } = useQuery<Lesson>({ queryKey: ["/api/lessons", lessonId] });
  const { data: unit } = useQuery<Unit>({ queryKey: ["/api/units", unitId] });
  const { data: allLessons } = useQuery<Lesson[]>({ queryKey: ["/api/units", unitId, "lessons"] });

  const [step, setStep] = useState<LessonStep>("learn");
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [matchSelection, setMatchSelection] = useState<{ side: "left" | "right"; index: number } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isExerciseSpeaking, setIsExerciseSpeaking] = useState(false);
  const speakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exerciseSpeakTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const content: LessonContent | null = useMemo(() => {
    if (!lesson) return null;
    try { return JSON.parse(lesson.content); } catch { return null; }
  }, [lesson]);

  const saveMutation = useMutation({
    mutationFn: async (data: { lessonId: number; completed: boolean; score: number }) => {
      await apiRequest("POST", "/api/progress", { ...data, lastAccessed: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress"] });
    },
  });

  const exercises = content?.exercises || [];
  const currentExercise = exercises[exerciseIndex];
  const totalExercises = exercises.length;

  const nextLesson = allLessons?.find(l => l.order === (lesson?.order || 0) + 1);

  // Build a lookup map: gurmukhi → romanized from lesson vocab items
  const gurmukhiLookup = useMemo(() => {
    const map = new Map<string, string>();
    (content?.items || []).forEach(item => {
      if (item.gurmukhi && item.romanized) map.set(item.gurmukhi.trim(), item.romanized.trim());
    });
    return map;
  }, [content]);

  const handleSpeak = useCallback((item: { gurmukhi: string; romanized: string }) => {
    if (speakTimer.current) clearTimeout(speakTimer.current);
    setIsSpeaking(true);
    speakPunjabi(item.gurmukhi, item.romanized);
    speakTimer.current = setTimeout(() => setIsSpeaking(false), 2500);
  }, []);

  const handleExerciseSpeak = useCallback((question: string) => {
    if (exerciseSpeakTimer.current) clearTimeout(exerciseSpeakTimer.current);
    setIsExerciseSpeaking(true);
    const gurmukhiMatch = question.match(/[\u0A00-\u0A7F\s]+/g);
    const gurmukhiText = gurmukhiMatch ? gurmukhiMatch.join(" ").trim() : question;
    speakPunjabi(gurmukhiText, question);
    exerciseSpeakTimer.current = setTimeout(() => setIsExerciseSpeaking(false), 2500);
  }, []);

  const handleChooseAnswer = (optionIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(optionIndex);
    setShowResult(true);
    if (optionIndex === currentExercise?.correct) {
      setScore(s => s + 1);
    }
  };

  const handleMatchClick = (side: "left" | "right", index: number) => {
    if (matchedPairs.has(index) && side === "left") return;
    if (!matchSelection) { setMatchSelection({ side, index }); return; }
    if (matchSelection.side === side) { setMatchSelection({ side, index }); return; }
    const pairs = currentExercise?.pairs || [];
    const leftIdx = side === "left" ? index : matchSelection.index;
    const rightIdx = side === "right" ? index : matchSelection.index;
    if (pairs[leftIdx] && pairs[leftIdx][1] === pairs[rightIdx]?.[1]) {
      if (leftIdx === rightIdx) {
        setMatchedPairs(prev => new Set([...prev, leftIdx]));
        setScore(s => s + 1);
      }
    }
    setMatchSelection(null);
  };

  const handleNextExercise = () => {
    if (exerciseIndex < totalExercises - 1) {
      setExerciseIndex(i => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setMatchedPairs(new Set());
      setMatchSelection(null);
    } else {
      setStep("complete");
      saveMutation.mutate({ lessonId, completed: true, score });
    }
  };

  const handleRestart = () => {
    setStep("learn");
    setCurrentItemIndex(0);
    setExerciseIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setMatchedPairs(new Set());
    setMatchSelection(null);
  };

  // Helper: detect Gurmukhi characters
  const hasGurmukhi = (s: string) => /[\u0A00-\u0A7F]/.test(s);

  /**
   * Resolve the romanized text for a raw option string.
   * 1. If the option already contains "(romanized)" — parse it out.
   * 2. Otherwise look up the full string in the vocab lookup map.
   * 3. Fallback: look up with the Gurmukhi-only portion (strip any trailing English).
   */
  const resolveRomanized = (text: string): { gurmukhi: string; romanized: string | null } => {
    // Already has parens form: "ਸ਼ੁਕਰੀਆ (Shukriya)"
    const parenMatch = text.match(/^(.+?)\s*\((.+?)\)$/);
    if (parenMatch) return { gurmukhi: parenMatch[1].trim(), romanized: parenMatch[2].trim() };

    // Plain Gurmukhi — look up in vocab items
    const trimmed = text.trim();
    const fromMap = gurmukhiLookup.get(trimmed);
    if (fromMap) return { gurmukhi: trimmed, romanized: fromMap };

    // Try matching just the Gurmukhi portion (e.g. "੫ - ਪੰਜ" → look up "ਪੰਜ")
    const gurmukhiOnly = trimmed.match(/[\u0A00-\u0A7F][\u0A00-\u0A7F\s]*/)?.[0]?.trim();
    if (gurmukhiOnly) {
      const fromPartial = gurmukhiLookup.get(gurmukhiOnly);
      if (fromPartial) return { gurmukhi: trimmed, romanized: fromPartial };
    }

    return { gurmukhi: trimmed, romanized: null };
  };

  /**
   * Replaces every Gurmukhi word/phrase in a question string with
   * JSX that shows the script followed by (romanized).
   * Looks up romanized form from content.items first.
   */
  const renderQuestionWithRomanized = (question: string) => {
    const parts = question.split(/((?:[\u0A00-\u0A7F]+(?:\s+[\u0A00-\u0A7F]+)*))/g);

    return (
      <>
        {parts.map((part, idx) => {
          if (!hasGurmukhi(part)) return <span key={idx}>{part}</span>;
          const trimmed = part.trim();
          const romanized = gurmukhiLookup.get(trimmed);
          return (
            <span key={idx} className="inline-flex items-baseline gap-1 flex-wrap">
              <span className="gurmukhi font-semibold">{part}</span>
              {romanized && (
                <span className="text-primary font-semibold text-sm">({romanized})</span>
              )}
            </span>
          );
        })}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="page-enter mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-7 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="page-enter mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12 text-center">
        <p className="text-muted-foreground">Content unavailable.</p>
        <button onClick={() => navigate(`/learn/${unitId}`)} className="mt-4 px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors">
          Back to Unit
        </button>
      </div>
    );
  }

  const items = content.items || [];
  const currentItem = items[currentItemIndex];
  const progressPercent = step === "learn"
    ? ((currentItemIndex + 1) / Math.max(items.length, 1)) * 50
    : step === "exercise"
    ? 50 + ((exerciseIndex + 1) / Math.max(totalExercises, 1)) * 50
    : 100;

  return (
    <div className="page-enter mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back button */}
      <button
        onClick={() => navigate(`/learn/${unitId}`)}
        className="inline-flex items-center gap-1 mb-6 -ml-1 text-sm text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer p-1 rounded transition-colors hover:bg-accent"
        aria-label={`Back to ${unit?.title || 'Unit'}`}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to {unit?.title || "Unit"}
      </button>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>{lesson?.title}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* LEARN STEP */}
      {step === "learn" && currentItem && (
        <div className="space-y-6">
          <p className="text-muted-foreground text-sm">{content.intro}</p>

          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-primary/8 border border-primary/20 text-xs text-muted-foreground">
            <Volume2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>
              Tap the <span className="font-semibold text-foreground">🔊 speaker button</span> on any card to hear the word spoken aloud.
            </p>
          </div>

          <div className="relative rounded-2xl border bg-card shadow-sm p-8 text-center space-y-3">
            <button
              onClick={() => handleSpeak(currentItem)}
              aria-label="Pronounce this word in Punjabi"
              className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
                isSpeaking
                  ? "bg-primary/20 text-primary animate-pulse"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              }`}
            >
              <Volume2 className="h-5 w-5" />
            </button>

            <div className="text-5xl font-bold leading-tight gurmukhi">{currentItem.gurmukhi}</div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Pronunciation</span>
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xl">
                {currentItem.romanized}
              </div>
            </div>

            <div className="text-base text-muted-foreground pt-1">{currentItem.english}</div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {currentItemIndex + 1} / {items.length}
            </span>
            <div className="flex gap-2">
              {currentItemIndex > 0 && (
                <Button variant="outline" size="sm" onClick={() => setCurrentItemIndex(i => i - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {currentItemIndex < items.length - 1 ? (
                <Button size="sm" onClick={() => setCurrentItemIndex(i => i + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" onClick={() => setStep("exercise")}>
                  Start Quiz <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>

          <div className="flex justify-center gap-1.5 pt-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentItemIndex(i)}
                aria-label={`Go to item ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === currentItemIndex ? "w-4 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* EXERCISE STEP */}
      {step === "exercise" && currentExercise && (
        <div className="space-y-6">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Question {exerciseIndex + 1} of {totalExercises}</span>
            <span>Score: {score}</span>
          </div>

          <div className="rounded-2xl border bg-card shadow-sm p-6 space-y-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {/* Question text — Gurmukhi words get (romanized) appended inline */}
                <p className="font-semibold text-lg leading-relaxed">
                  {renderQuestionWithRomanized(currentExercise.question)}
                </p>
              </div>
              <button
                onClick={() => handleExerciseSpeak(currentExercise.question)}
                aria-label="Hear the Punjabi in this question"
                className={`shrink-0 p-2 rounded-full transition-colors ${
                  isExerciseSpeaking
                    ? "bg-primary/20 text-primary animate-pulse"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                }`}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>

            {currentExercise.type === "choose" && currentExercise.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentExercise.options.map((option, i) => {
                  let extra = "";
                  if (showResult) {
                    if (i === currentExercise.correct) extra = "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300";
                    else if (i === selectedAnswer) extra = "border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300";
                  }
                  const { gurmukhi, romanized } = resolveRomanized(option);
                  const isGurmukhi = hasGurmukhi(gurmukhi);
                  return (
                    <button
                      key={i}
                      onClick={() => handleChooseAnswer(i)}
                      disabled={showResult}
                      className={`rounded-xl border-2 px-4 py-3 text-left transition-all
                        ${showResult ? "cursor-default" : "hover:border-primary hover:bg-accent"}
                        ${!extra ? "border-border" : ""} ${extra}`}
                    >
                      {isGurmukhi ? (
                        <span className="flex flex-col gap-0.5">
                          <span className="gurmukhi text-sm font-semibold">{gurmukhi}</span>
                          {romanized && (
                            <span className="text-xs text-primary font-semibold">({romanized})</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-sm font-medium">{option}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {currentExercise.type === "match" && currentExercise.pairs && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  {currentExercise.pairs.map((pair, i) => {
                    const { gurmukhi, romanized } = resolveRomanized(pair[0]);
                    return (
                      <button
                        key={i}
                        onClick={() => handleMatchClick("left", i)}
                        disabled={matchedPairs.has(i)}
                        className={`w-full rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all text-left
                          ${matchedPairs.has(i) ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 line-through" : ""}
                          ${matchSelection?.side === "left" && matchSelection.index === i ? "border-primary bg-accent" : "border-border"}
                          ${!matchedPairs.has(i) ? "hover:border-primary hover:bg-accent" : ""}`}
                      >
                        {hasGurmukhi(gurmukhi) ? (
                          <span className="flex flex-col gap-0">
                            <span className="gurmukhi font-semibold">{gurmukhi}</span>
                            {romanized && (
                              <span className="text-xs text-primary font-semibold not-italic">({romanized})</span>
                            )}
                          </span>
                        ) : (
                          pair[0]
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {currentExercise.pairs.map((pair, i) => {
                    const { gurmukhi, romanized } = resolveRomanized(pair[1]);
                    return (
                      <button
                        key={i}
                        onClick={() => handleMatchClick("right", i)}
                        disabled={matchedPairs.has(i)}
                        className={`w-full rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all text-left
                          ${matchedPairs.has(i) ? "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 line-through" : ""}
                          ${matchSelection?.side === "right" && matchSelection.index === i ? "border-primary bg-accent" : "border-border"}
                          ${!matchedPairs.has(i) ? "hover:border-primary hover:bg-accent" : ""}`}
                      >
                        {hasGurmukhi(gurmukhi) ? (
                          <span className="flex flex-col gap-0">
                            <span className="gurmukhi font-semibold">{gurmukhi}</span>
                            {romanized && (
                              <span className="text-xs text-primary font-semibold not-italic">({romanized})</span>
                            )}
                          </span>
                        ) : (
                          pair[1]
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {showResult && (
              <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
                selectedAnswer === currentExercise.correct
                  ? "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300"
                  : "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
              }`}>
                {selectedAnswer === currentExercise.correct
                  ? <><CheckCircle2 className="h-4 w-4" /> Correct! Well done.</>
                  : <><XCircle className="h-4 w-4" /> The correct answer was: {currentExercise.options?.[currentExercise.correct ?? 0]}</>
                }
              </div>
            )}
          </div>

          {(showResult || currentExercise.type === "match") && (
            <div className="flex justify-end">
              <Button onClick={handleNextExercise}>
                {exerciseIndex < totalExercises - 1 ? "Next Question" : "Finish Lesson"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* COMPLETE STEP */}
      {step === "complete" && (
        <div className="text-center space-y-6 py-8">
          <div className="text-6xl">🎉</div>
          <Trophy className="h-16 w-16 text-amber-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Lesson Complete!</h2>
            <p className="text-muted-foreground">
              You scored {score} out of {totalExercises}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart Lesson
            </Button>
            {nextLesson ? (
              <Button onClick={() => navigate(`/learn/${unitId}/${nextLesson.id}`)}>
                Next Lesson <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => navigate(`/learn/${unitId}`)}>
                Back to Unit
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
