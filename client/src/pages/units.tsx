import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { type Unit, type UserProgress } from "@shared/schema";
import { unitColors } from "@/lib/curriculum";
import { Skeleton } from "@/components/ui/skeleton";
import { PenTool, HandMetal, Hash, Users, Utensils, MapPin, ChevronRight, Lock } from "lucide-react";

const iconMap: Record<string, any> = {
  "pen-tool": PenTool,
  "hand-metal": HandMetal,
  "hash": Hash,
  "users": Users,
  "utensils": Utensils,
  "map-pin": MapPin,
};

export default function Units() {
  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({ queryKey: ["/api/units"] });
  const { data: progress } = useQuery<UserProgress[]>({ queryKey: ["/api/progress"] });

  const completedLessons = new Set(progress?.filter(p => p.completed).map(p => p.lessonId) || []);

  return (
    <div className="page-enter mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="text-xl font-bold mb-1" data-testid="text-units-title">Your Learning Path</h1>
        <p className="text-sm text-muted-foreground">Choose a unit to explore lessons, vocabulary, and exercises</p>
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {units?.map((unit, index) => {
            const colors = unitColors[unit.color] || unitColors.amber;
            const Icon = iconMap[unit.icon] || BookOpen;

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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
