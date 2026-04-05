import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { type Unit, type Lesson, type UserProgress } from "@shared/schema";
import { unitColors } from "@/lib/curriculum";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ChevronLeft, ChevronRight, CheckCircle2, BookOpen, MessageSquare, Pen, FlaskConical, Globe2, Lock } from "lucide-react";

const typeIcons: Record<string, any> = {
  vocabulary: BookOpen,
  phrases: MessageSquare,
  grammar: FlaskConical,
  practice: Pen,
  culture: Globe2,
};

const typeLabels: Record<string, string> = {
  vocabulary: "Vocabulary",
  phrases: "Phrases",
  grammar: "Grammar",
  practice: "Practice",
  culture: "Culture",
};

export default function UnitLessons() {
  const params = useParams<{ unitId: string }>();
  const [, navigate] = useLocation();
  // IMPORTANT: destructure loading — never redirect until auth is resolved
  const { user, loading } = useAuth();
  const unitId = parseInt(params.unitId || "1");

  // Still resolving session — show skeleton, do NOT redirect yet
  if (loading) {
    return (
      <div className="page-enter mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <Skeleton className="h-5 w-24 mb-6" />
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  // We proceed to UnitLessonsContent; it will check unit.order and redirect guests if order > 1.
  return <UnitLessonsContent unitId={unitId} user={user} navigate={navigate} />;
}

function UnitLessonsContent({ unitId, user, navigate }: { unitId: number; user: any; navigate: any }) {
  const { data: unit, isLoading: unitLoading } = useQuery<Unit>({ queryKey: ["/api/units", unitId] });
  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({ queryKey: ["/api/units", unitId, "lessons"] });

  // Guest Redirect Logic — wait until unit metadata is available
  if (!unitLoading && !user && unit && unit.order > 1) {
    navigate("/login");
    return null;
  }
  // Only fetch progress when the user is logged in — prevents a 401 for guests
  // browsing the free Unit 1 lesson list.
  const { data: progress } = useQuery<UserProgress[]>({
    queryKey: ["/api/progress"],
    enabled: !!user,
  });

  const completedLessons = new Set(progress?.filter(p => p.completed).map(p => p.lessonId) || []);
  const colors = unitColors[unit?.color || "amber"] || unitColors.amber;

  if (unitLoading || lessonsLoading) {
    return (
      <div className="page-enter mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
        <Skeleton className="h-5 w-24 mb-6" />
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back nav */}
      <button
        onClick={() => navigate("/learn")}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-6 bg-transparent border-none p-0"
        data-testid="link-back-units"
      >
        <ChevronLeft className="h-4 w-4" /> All Units
      </button>

      {/* Unit header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.accent} ${colors.text}`}>
            Unit {unit?.order}
          </span>
        </div>
        <h1 className="text-xl font-bold mb-0.5" data-testid="text-unit-detail-title">{unit?.title}</h1>
        <p className="gurmukhi text-sm text-muted-foreground mb-1">{unit?.titlePunjabi}</p>
        <p className="text-sm text-muted-foreground">{unit?.description}</p>
      </div>

      {/* Progress bar */}
      {lessons && lessons.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>{lessons.filter(l => completedLessons.has(l.id)).length} of {lessons.length} lessons completed</span>
            <span>{Math.round((lessons.filter(l => completedLessons.has(l.id)).length / lessons.length) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(lessons.filter(l => completedLessons.has(l.id)).length / lessons.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Lesson list */}
      <div className="space-y-3">
        {lessons?.map((lesson, index) => {
          const isCompleted = completedLessons.has(lesson.id);
          const TypeIcon = typeIcons[lesson.type] || BookOpen;

          return (
            <Link key={lesson.id} href={`/learn/${unitId}/${lesson.id}`}>
              <div
                className={`group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isCompleted
                    ? "border-primary/20 bg-primary/5"
                    : "border-border/60 bg-card hover:border-primary/30"
                }`}
                data-testid={`card-lesson-${lesson.id}`}
              >
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${
                  isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-semibold truncate">{lesson.title}</h3>
                    <span className="flex-shrink-0 inline-flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                      <TypeIcon className="h-2.5 w-2.5" />
                      {typeLabels[lesson.type]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{lesson.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Empty state */}
      {lessons?.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-sm font-semibold mb-1">No lessons yet</h3>
          <p className="text-xs text-muted-foreground">Lessons for this unit are coming soon.</p>
        </div>
      )}
    </div>
  );
}
