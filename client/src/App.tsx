import { Switch, Route, Router, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { NavHeader } from "@/components/nav-header";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Units from "@/pages/units";
import UnitLessons from "@/pages/unit-lessons";
import LessonPage from "@/pages/lesson";
import Practice from "@/pages/tutor";
import ProgressPage from "@/pages/progress-page";
import AlphabetPage from "@/pages/alphabet";
import AuthPage from "@/pages/auth";
import TermsPage from "@/pages/terms";
import PrivacyPage from "@/pages/privacy";

// Hard redirect if not logged in
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen" />;
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

// Lesson route: unit 1 is free, all others require login.
// We let the LessonPage handle the redirect after fetching the unit order
// to avoid assuming that the database ID always equals 1.
function LessonRoute({ unitId }: { unitId: string }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen" />;
  
  // If user is logged in, they can see everything.
  // If guest, we let them proceed to the page for now;
  // LessonPage will redirect if the unit's order is > 1.
  return <LessonPage />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      {/* Unit list + unit detail are intentionally NOT protected */}
      <Route path="/learn" component={Units} />
      <Route path="/learn/:unitId" component={UnitLessons} />
      {/* Unit 1 lessons are free; all other lessons require login */}
      <Route path="/learn/:unitId/:lessonId">
        {(params) => <LessonRoute unitId={params.unitId ?? "1"} />}
      </Route>
      <Route path="/alphabet" component={AlphabetPage} />
      <Route path="/practice">{() => <ProtectedRoute component={Practice} />}</Route>
      <Route path="/progress">{() => <ProtectedRoute component={ProgressPage} />}</Route>
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router>
            <NavHeader />
            <AppRouter />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
