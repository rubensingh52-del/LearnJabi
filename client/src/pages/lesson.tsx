import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { type Lesson, type Unit } from "@shared/schema";
import { type LessonContent, type Exercise } from "@/lib/curriculum";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, RotateCcw, Trophy } from "lucide-react";
import { useState, useMemo } from "react";

type LessonStep = "learn" | "exercise" | "complete";

export default function LessonPage() {
  const params = useParams<{ unitId: string; lessonId: string }>();
  const [, setLocation] = useLocation();
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

  // Find next lesson
  const nextLesson = allLessons?.find(l => l.order === (lesson?.order || 0) + 1);

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

    if (!matchSelection) {
      setMatchSelection({ side, index });
      return;
    }

    if (matchSelection.side === side) {
      setMatchSelection({ side, index });
      return;
    }

    // Check if match is correct
    const pairs = currentExercise?.pairs || [];
    const leftIdx = side === "left" ? index : matchSelection.index;
    const rightIdx = side === "right" ? index : matchSelection.index;

    if (pairs[leftIdx] && pairs[leftIdx][1] === pairs[rightIdx]?.[1]) {
      // Correct match (same pair index)
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
      // Complete lesson
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
        <p className="text-muted-foreground">Could not load lesson content.</p>
        <Link href={`/learn/${unitId}`}>
          <Button variant="secondary" className="mt-4">Back to Unit</Button>
        </Link>
      </div>
    );
  }

  const progressPercent = step === "learn"
    ? ((currentItemIndex + 1) / content.items.length) * 50
    : step === "exercise"
    ? 50 + ((exerciseIndex + 1) / Math.max(totalExercises, 1)) * 50
    : 100;

  return (
    <div className="page-enter mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Navigation */}
      <Link href={`/learn/${unitId}`}>
        <span className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-6" data-testid="link-back-unit">
          <ChevronLeft className="h-4 w-4" />
          {unit?.title || "Back to Unit"}
        </span>
      </Link>

      {/* Progress bar */}
      <div className="mb-6">
        <Progress value={progressPercent} className="h-1.5" data-testid="progress-lesson" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{lesson?.title}</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* LEARN STEP */}
      {step === "learn" && (
        <div>
          <div className="mb-6">
            <h1 className="text-lg font-bold mb-1" data-testid="text-lesson-title">{lesson?.title}</h1>
            <p className="gurmukhi text-sm text-muted-foreground">{lesson?.titlePunjabi}</p>
          </div>

          {/* Intro */}
          {currentItemIndex === 0 && (
            <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-sm leading-relaxed" data-testid="text-lesson-intro">{content.intro}</p>
            </div>
          )}

          {/* Vocab card */}
          <div className="bg-card border border-card-border rounded-xl p-6 sm:p-8 text-center mb-6" data-testid="card-vocab-item">
            <p className="gurmukhi text-4xl sm:text-5xl font-bold mb-4 text-foreground">
              {content.items[currentItemIndex]?.gurmukhi}
            </p>
            <p className="text-base font-semibold mb-1">{content.items[currentItemIndex]?.romanized}</p>
            <p className="text-sm text-muted-foreground">{content.items[currentItemIndex]?.english}</p>
          </div>

          {/* Item dots */}
          <div className="flex justify-center gap-1.5 mb-6">
            {content.items.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentItemIndex(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === currentItemIndex ? "bg-primary w-6" : i < currentItemIndex ? "bg-primary/40" : "bg-muted"
                }`}
                data-testid={`dot-item-${i}`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between gap-4">
            <Button
              variant="secondary"
              onClick={() => setCurrentItemIndex(i => Math.max(0, i - 1))}
              disabled={currentItemIndex === 0}
              data-testid="button-prev-item"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {currentItemIndex < content.items.length - 1 ? (
              <Button onClick={() => setCurrentItemIndex(i => i + 1)} data-testid="button-next-item">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={() => { setStep("exercise"); }} data-testid="button-start-exercises">
                Start Exercises
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* EXERCISE STEP */}
      {step === "exercise" && currentExercise && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold">Exercise {exerciseIndex + 1} of {totalExercises}</h2>
            <span className="text-xs text-muted-foreground">Score: {score}</span>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-6 mb-6" data-testid="card-exercise">
            <p className="text-sm font-semibold mb-4">{currentExercise.question}</p>

            {/* Multiple choice */}
            {currentExercise.type === "choose" && currentExercise.options && (
              <div className="space-y-2">
                {currentExercise.options.map((option, i) => {
                  const isSelected = selectedAnswer === i;
                  const isCorrect = i === currentExercise.correct;

                  let classes = "w-full text-left p-3 rounded-lg border text-sm font-medium transition-all ";
                  if (!showResult) {
                    classes += "border-border/60 hover:border-primary/40 cursor-pointer";
                  } else if (isCorrect) {
                    classes += "border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400";
                  } else if (isSelected && !isCorrect) {
                    classes += "border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400";
                  } else {
                    classes += "border-border/40 opacity-50";
                  }

                  // Check if option is Gurmukhi (contains Gurmukhi Unicode range)
                  const isGurmukhi = /[\u0A00-\u0A7F]/.test(option);
                  // Try to find pronunciation from content items
                  const matchedItem = isGurmukhi ? content?.items.find(item => option.includes(item.gurmukhi)) : null;

                  return (
                    <button
                      key={i}
                      onClick={() => handleChooseAnswer(i)}
                      className={classes}
                      disabled={showResult}
                      data-testid={`button-option-${i}`}
                    >
                      <span className="flex items-center gap-3">
                        <span>
                          <span className="gurmukhi">{option}</span>
                          {matchedItem && <span className="block text-xs text-primary/70 italic mt-0.5">{matchedItem.romanized}</span>}
                        </span>
                        {showResult && isCorrect && <CheckCircle2 className="h-4 w-4 ml-auto text-green-600" />}
                        {showResult && isSelected && !isCorrect && <XCircle className="h-4 w-4 ml-auto text-red-500" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Matching */}
            {currentExercise.type === "match" && currentExercise.pairs && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  {currentExercise.pairs.map((pair, i) => {
                    const matchedItem = content?.items.find(item => pair[0].includes(item.gurmukhi));
                    return (
                      <button
                        key={`l-${i}`}
                        onClick={() => handleMatchClick("left", i)}
                        disabled={matchedPairs.has(i)}
                        className={`w-full p-3 rounded-lg border text-sm text-left font-medium transition-all ${
                          matchedPairs.has(i)
                            ? "border-green-500 bg-green-50 dark:bg-green-950/30 opacity-60"
                            : matchSelection?.side === "left" && matchSelection.index === i
                            ? "border-primary bg-primary/10"
                            : "border-border/60 hover:border-primary/40 cursor-pointer"
                        }`}
                        data-testid={`button-match-left-${i}`}
                      >
                        <span className="gurmukhi">{pair[0]}</span>
                        {matchedItem && <span className="block text-xs text-primary/70 italic mt-0.5 font-normal">{matchedItem.romanized}</span>}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  {currentExercise.pairs.map((pair, i) => (
                    <button
                      key={`r-${i}`}
                      onClick={() => handleMatchClick("right", i)}
                      disabled={matchedPairs.has(i)}
                      className={`w-full p-3 rounded-lg border text-sm text-left font-medium transition-all ${
                        matchedPairs.has(i)
                          ? "border-green-500 bg-green-50 dark:bg-green-950/30 opacity-60"
                          : matchSelection?.side === "right" && matchSelection.index === i
                          ? "border-primary bg-primary/10"
                          : "border-border/60 hover:border-primary/40 cursor-pointer"
                      }`}
                      data-testid={`button-match-right-${i}`}
                    >
                      {pair[1]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exercise navigation */}
          {(showResult || (currentExercise.type === "match" && matchedPairs.size === (currentExercise.pairs?.length || 0))) && (
            <Button onClick={handleNextExercise} className="w-full" data-testid="button-next-exercise">
              {exerciseIndex < totalExercises - 1 ? "Next Exercise" : "Complete Lesson"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* COMPLETE STEP */}
      {step === "complete" && (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-lg font-bold mb-1" data-testid="text-lesson-complete">Lesson Complete!</h2>
          <p className="gurmukhi text-xl text-primary mb-2">ਬਹੁਤ ਵਧੀਆ!</p>
          <p className="text-sm text-muted-foreground mb-1">Bahut vadhia! — Excellent!</p>
          <p className="text-sm text-muted-foreground mb-6">You scored {score} out of {totalExercises} exercises</p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Button variant="secondary" onClick={handleRestart} data-testid="button-retry-lesson">
              <RotateCcw className="h-4 w-4 mr-1" />
              Practice Again
            </Button>
            {nextLesson ? (
              <Link href={`/learn/${unitId}/${nextLesson.id}`}>
                <Button onClick={handleRestart} data-testid="button-next-lesson">
                  Next Lesson
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            ) : (
              <Link href={`/learn/${unitId}`}>
                <Button data-testid="button-back-to-unit">
                  Back to Unit
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
