import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, BookOpen, ArrowLeft, RotateCcw, CheckCircle2, Sparkles } from "lucide-react";

// Capture the hash IMMEDIATELY at module load — before the Supabase client
// can process and clear it from the URL during its own initialisation.
const INITIAL_HASH = typeof window !== "undefined" ? window.location.hash : "";

// ── Schemas ───────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Enter your email or username")
    .refine(
      (v) => v.includes("@") ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) : v.length >= 3,
      "Enter a valid email or username (min 3 characters)"
    ),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;
type ForgotData = z.infer<typeof forgotSchema>;

// ── Username → email lookup ───────────────────────────────────────────────────
async function resolveEmail(identifier: string): Promise<string | null> {
  if (identifier.includes("@")) return identifier;
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .eq("username", identifier)
    .single();
  if (error || !data) return null;
  return data.email as string;
}

// ── Brand header shared across all screens ────────────────────────────────────
function Brand() {
  return (
    <div className="flex flex-col items-center gap-2 mb-8">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
        <BookOpen className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">LearnJabi</h1>
      <p className="text-sm text-muted-foreground">Your journey into Punjabi starts here.</p>
    </div>
  );
}

// ── Email verified success screen ────────────────────────────────────────────
function EmailVerifiedScreen() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/learn"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Brand />
        <Card className="border-border/60 overflow-hidden">
          <CardContent className="pt-10 pb-10 px-8 text-center space-y-6">
            {/* Success icon */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping opacity-30" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Email verified!</h2>
              <p className="text-sm text-muted-foreground">
                Your account is confirmed. Taking you to your lessons&hellip;
              </p>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-[grow_3s_ease-in-out_forwards]" style={{ width: '100%', transformOrigin: 'left', animation: 'grow 3s ease-in-out forwards' }} />
            </div>

            <Button className="w-full gap-2" onClick={() => navigate("/learn")}>
              <Sparkles className="h-4 w-4" />
              Start Learning Now
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Email sent screen ─────────────────────────────────────────────────────────
function EmailSentScreen({ email, onResend, onBack, onLogin }: {
  email: string;
  onResend: () => Promise<void>;
  onBack: () => void;
  onLogin: () => void;
}) {
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    await onResend();
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Brand />
        <Card className="border-border/60">
          <CardContent className="pt-8 pb-8 px-8 text-center space-y-6">

            {/* Animated envelope */}
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-ping opacity-30" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/15 border border-amber-500/30">
                <svg className="w-9 h-9 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <CardTitle className="text-xl">Check your inbox</CardTitle>
              <CardDescription className="text-sm">
                We sent a confirmation link to
              </CardDescription>
              <p className="font-semibold text-foreground text-sm break-all">{email}</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Click the link in the email to verify your account, then come back here to log in. It may take a minute to arrive.
            </p>

            {/* Tips box */}
            <div className="text-left rounded-lg bg-muted/50 border border-border/50 p-4 space-y-1.5">
              <p className="text-xs font-semibold text-foreground">Can't find it?</p>
              <p className="text-xs text-muted-foreground">• Check your spam or junk folder</p>
              <p className="text-xs text-muted-foreground">• Make sure <span className="font-mono text-foreground/70">{email}</span> is correct</p>
              <p className="text-xs text-muted-foreground">• Wait a minute — sometimes email is slow</p>
            </div>

            {/* Resend button */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleResend}
              disabled={resending || resent}
            >
              {resending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : resent ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              {resent ? "Email resent!" : "Resend confirmation email"}
            </Button>

            {/* Log in button */}
            <Button className="w-full gap-2" onClick={onLogin}>
              Log in
            </Button>

            {/* Back link */}
            <button
              onClick={onBack}
              className="flex items-center justify-center gap-1.5 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to sign up
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Forgot password screen ────────────────────────────────────────────────────
function ForgotPasswordScreen({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotData>({ resolver: zodResolver(forgotSchema) });

  async function onSubmit(data: ForgotData) {
    setPending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setPending(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Brand />
        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              {sent
                ? "Check your inbox for a reset link."
                : "Enter your email and we'll send you a link to reset your password."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  If that email is registered, you'll receive a reset link shortly. Check your spam folder too.
                </p>
              </div>
            ) : (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="forgot-email">Email address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={pending}>
                  {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send reset link
                </Button>
              </form>
            )}

            <button
              onClick={onBack}
              className="flex items-center justify-center gap-1.5 mx-auto text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main auth page ────────────────────────────────────────────────────────────
type View = "auth" | "email-sent" | "forgot" | "verified";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [view, setView] = useState<View>("auth");
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  // Detect Supabase email-verification redirect.
  // We use INITIAL_HASH (captured at module load) because the Supabase client
  // wipes window.location.hash before our useEffect can read it.
  useEffect(() => {
    if (INITIAL_HASH.includes("access_token") && INITIAL_HASH.includes("type=signup")) {
      setView("verified");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  const [pending, setPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  async function onLogin(data: LoginData) {
    setPending(true);
    let email = data.identifier.trim();
    if (!email.includes("@")) {
      const resolved = await resolveEmail(email);
      if (!resolved) {
        setPending(false);
        loginForm.setError("identifier", { message: "Username not found" });
        return;
      }
      email = resolved;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: data.password });
    setPending(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast({
          title: "Email not verified",
          description: "Click the confirmation link we sent to your email before logging in.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      }
    } else {
      navigate("/learn");
    }
  }

  async function onRegister(data: RegisterData) {
    setPending(true);
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { username: data.username },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    setPending(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }
    if (authData.session) {
      // Email confirmation disabled — log straight in
      navigate("/learn");
      return;
    }
    setRegisteredEmail(data.email);
    setView("email-sent");
  }

  async function handleResend() {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: registeredEmail,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      toast({ title: "Couldn't resend", description: error.message, variant: "destructive" });
    }
  }

  // ── Overlay screens ──────────────────────────────────────────────────────
  if (view === "verified") {
    return <EmailVerifiedScreen />;
  }

  if (view === "email-sent") {
    return (
      <EmailSentScreen
        email={registeredEmail}
        onResend={handleResend}
        onLogin={() => {
          setView("auth");
          setActiveTab("login");
          loginForm.setValue("identifier", registeredEmail);
        }}
        onBack={() => {
          setView("auth");
          setActiveTab("register");
        }}
      />
    );
  }

  if (view === "forgot") {
    return <ForgotPasswordScreen onBack={() => setView("auth")} />;
  }

  // ── Login / Register tabs ────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Brand />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* ── LOGIN ── */}
          <TabsContent value="login">
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your details to continue learning.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="login-identifier">Email or Username</Label>
                    <Input
                      id="login-identifier"
                      type="text"
                      placeholder="you@example.com or yourname"
                      autoComplete="username"
                      {...loginForm.register("identifier")}
                    />
                    {loginForm.formState.errors.identifier && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.identifier.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setView("forgot")}
                        className="text-xs text-amber-500 hover:text-amber-400 transition-colors font-medium"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...loginForm.register("password")}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── REGISTER ── */}
          <TabsContent value="register">
            <Card className="border-border/60">
              <CardHeader className="pb-4">
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Start learning Punjabi for free.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input
                      id="reg-username"
                      placeholder="yourname"
                      autoComplete="username"
                      {...registerForm.register("username")}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...registerForm.register("email")}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...registerForm.register("password")}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-confirm">Confirm Password</Label>
                    <Input
                      id="reg-confirm"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      {...registerForm.register("confirmPassword")}
                    />
                    {registerForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                    )}
                  </div>
                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to LearnJabi's{" "}
          <a href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">terms of service</a>
          {" "}and{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">privacy policy</a>.
        </p>
      </div>
    </div>
  );
}
