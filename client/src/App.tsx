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

// Wrapper that redirects to /login if user is not authenticated
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return null; // wait for session check
  if (!user) return <Redirect to="/login" />;
  return <Component />;
}

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={AuthPage} />
      <Route path="/register" component={AuthPage} />
      <Route path="/learn">{() => <ProtectedRoute component={Units} />}</Route>
      <Route path="/learn/:unitId">{() => <ProtectedRoute component={UnitLessons} />}</Route>
      <Route path="/learn/:unitId/:lessonId">{() => <ProtectedRoute component={LessonPage} />}</Route>
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
