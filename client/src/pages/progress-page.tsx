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
  RotateCcw, XCircle, ChevronLeft
} from "lucide-react";



function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

// ─── Main Progress Page ───────────────────────────────────────────────────────
export default function ProgressPage() {
  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({ queryKey: ["/api/units"] });
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery<Lesson[]>({ queryKey: ["/api/lessons"] });
  const { data: progress, isLoading: progressLoading } = useQuery<UserProgress[]>({ queryKey: ["/api/progress"] });

  const completedLessons = progress?.filter(p => p.completed) || [];
  const totalScore = completedLessons.reduce((sum, p) => sum + p.score, 0);
  const uniqueLessonsCompleted = new Set(completedLessons.map(p => p.lessonId)).size;

  // Streak: use lastAccessed (now correctly returned by server)
  const lastAccessDates = [...new Set(
    (progress || [])
      .filter(p => p.lastAccessed)
      .map(p => (p.lastAccessed as string).split("T")[0])
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
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
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
