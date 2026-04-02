import { Switch, Route, Router, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
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

// Hard redirect if not logged in
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

// Unit 1 lessons are free — only protect units 2+
function LessonRoute() {
  const { user, loading } = useAuth();
  // Parse unitId from current hash location
  const hash = window.location.hash;
  const match = hash.match(/#\/learn\/(\d+)\/(\d+)/);
  const unitId = match ? parseInt(match[1]) : 1;

  if (loading) return null;
  // Unit 1 is always accessible without login
  if (unitId === 1) return <LessonPage />;
  // All other units require login
  if (!user) return <Redirect to="/login" />;
  return <LessonPage />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      {/* Unit list + unit detail are intentionally NOT protected — paywall is inline */}
      <Route path="/learn" component={Units} />
      <Route path="/learn/:unitId" component={UnitLessons} />
      {/* Unit 1 lessons are free; all other lessons require login */}
      <Route path="/learn/:unitId/:lessonId">{() => <LessonRoute />}</Route>
      <Route path="/alphabet" component={AlphabetPage} />
      <Route path="/practice">{() => <ProtectedRoute component={Practice} />}</Route>
      <Route path="/progress">{() => <ProtectedRoute component={ProgressPage} />}</Route>
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
          <Router hook={useHashLocation}>
            <NavHeader />
            <AppRouter />
          </Router>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
