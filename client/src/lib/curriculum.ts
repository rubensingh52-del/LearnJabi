// Shared types for curriculum data
export interface VocabItem {
  gurmukhi: string;
  romanized: string;
  english: string;
  audio: string;
}

export interface Exercise {
  type: "choose" | "match";
  question: string;
  options?: string[];
  correct?: number;
  pairs?: string[][];
}

export interface LessonContent {
  intro: string;
  items: VocabItem[];
  exercises: Exercise[];
}

export const unitColors: Record<string, { bg: string; text: string; accent: string; light: string }> = {
  amber: { bg: "bg-amber-500", text: "text-amber-700 dark:text-amber-400", accent: "bg-amber-100 dark:bg-amber-950", light: "bg-amber-50 dark:bg-amber-950/50" },
  emerald: { bg: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400", accent: "bg-emerald-100 dark:bg-emerald-950", light: "bg-emerald-50 dark:bg-emerald-950/50" },
  blue: { bg: "bg-blue-500", text: "text-blue-700 dark:text-blue-400", accent: "bg-blue-100 dark:bg-blue-950", light: "bg-blue-50 dark:bg-blue-950/50" },
  purple: { bg: "bg-purple-500", text: "text-purple-700 dark:text-purple-400", accent: "bg-purple-100 dark:bg-purple-950", light: "bg-purple-50 dark:bg-purple-950/50" },
  orange: { bg: "bg-orange-500", text: "text-orange-700 dark:text-orange-400", accent: "bg-orange-100 dark:bg-orange-950", light: "bg-orange-50 dark:bg-orange-950/50" },
  teal: { bg: "bg-teal-500", text: "text-teal-700 dark:text-teal-400", accent: "bg-teal-100 dark:bg-teal-950", light: "bg-teal-50 dark:bg-teal-950/50" },
};
