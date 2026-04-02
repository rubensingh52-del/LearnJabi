import { useState } from "react";
import { useLocation } from "wouter";
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
import { Loader2, BookOpen } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
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

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginPending, setLoginPending] = useState(false);
  const [registerPending, setRegisterPending] = useState(false);

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterData>({ resolver: zodResolver(registerSchema) });

  async function onLogin(data: LoginData) {
    setLoginPending(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    setLoginPending(false);
    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!", description: "You have logged in successfully." });
      navigate("/learn");
    }
  }

  async function onRegister(data: RegisterData) {
    setRegisterPending(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { username: data.username },
      },
    });
    setRegisterPending(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: "Account created!",
        description: "Check your email to confirm your account, then log in.",
      });
      setActiveTab("login");
      loginForm.setValue("email", data.email);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 text-white shadow-lg">
            <BookOpen className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">LearnJabi</h1>
          <p className="text-sm text-muted-foreground text-center">
            Your journey into Punjabi starts here.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
          <TabsList className="grid grid-cols-2 w-full mb-6">
            <TabsTrigger value="login">Log In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your details to continue learning.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      autoComplete="email"
                      {...loginForm.register("email")}
                    />
                    {loginForm.formState.errors.email && (
                      <p className="text-xs text-destructive">{loginForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="login-password">Password</Label>
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
                  <Button type="submit" className="w-full" disabled={loginPending}>
                    {loginPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Log In
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register">
            <Card>
              <CardHeader>
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
                  <Button type="submit" className="w-full" disabled={registerPending}>
                    {registerPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to LearnJabi's terms of service.
        </p>
      </div>
    </div>
  );
}
