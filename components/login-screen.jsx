"use client";

import { KeyRound, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginScreen({ needsSetup, onLogin }) {
  const [mode, setMode] = useState(needsSetup ? "signup" : "login");
  const [form, setForm] = useState({ name: "", email: "", password: "", profileImage: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const endpoint = isSignup ? "/api/auth/signup" : isForgot ? "/api/auth/forgot-password" : isReset ? "/api/auth/reset-password" : "/api/auth/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();

    if (response.ok && mode === "login") {
      onLogin(data.user);
    } else if (response.ok && mode === "signup") {
      setMessage("Account created. Please log in.");
      setMode("login");
    } else if (response.ok && mode === "forgot") {
      setMessage(data.message);
      setMode("reset");
    } else if (response.ok && mode === "reset") {
      setMessage("Password reset. Please log in.");
      setMode("login");
    } else {
      setError(data.message || "Something went wrong.");
    }

    setIsSubmitting(false);
  }

  const icon = isSignup ? <UserRound className="size-5" /> : isForgot || isReset ? <KeyRound className="size-5" /> : <LockKeyhole className="size-5" />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">{icon}</div>
          <CardTitle>{isSignup ? "Create an account" : isForgot ? "Forgot password" : isReset ? "Reset password" : "Login"}</CardTitle>
          <CardDescription>
            {isSignup && "Sign up to manage clients, projects, monthly billing, and invoices."}
            {mode === "login" && "Sign in to your client project workspace."}
            {isForgot && "Enter your email to start a local password reset."}
            {isReset && "Enter your email and new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={submit}>
            {isSignup && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={form.name} onChange={(event) => update("name", event.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="profileImage">Profile picture URL</Label>
                  <Input id="profileImage" value={form.profileImage} onChange={(event) => update("profileImage", event.target.value)} placeholder="https://..." />
                </div>
              </>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(event) => update("email", event.target.value)} required />
            </div>
            {!isForgot && (
              <div className="grid gap-2">
                <Label htmlFor="password">{isReset ? "New password" : "Password"}</Label>
                <Input id="password" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} required />
              </div>
            )}
            {message && <p className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">{message}</p>}
            {error && <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : isSignup ? "Sign up" : isForgot ? "Continue" : isReset ? "Reset password" : "Login"}
            </Button>
          </form>
          <div className="mt-4 grid gap-2 text-center text-sm">
            {mode === "login" && <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("forgot")}>Forgot password?</button>}
            {mode === "login" ? (
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("signup")}>Don&apos;t have an account? Sign up</button>
            ) : (
              <button className="text-muted-foreground hover:text-foreground" onClick={() => setMode("login")}>Already have an account? Login</button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
