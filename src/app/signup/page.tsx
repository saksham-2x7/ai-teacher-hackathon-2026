"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated) router.replace("/setup");
  }, [isAuthenticated, router]);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["" ,"Weak", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-yellow-500", "bg-hexagon-accent"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup(name, email, password);
  };

  return (
    <div className="min-h-screen flex bg-hexagon-bg">
      <div className="hidden lg:flex lg:w-1/2 bg-black flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-hexagon-accent/5 via-transparent to-blue-900/10" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-hexagon-accent flex items-center justify-center text-black font-bold text-lg">H</div>
          <span className="text-white text-xl font-semibold">HEXAGON</span>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="text-4xl font-semibold text-white leading-tight">Start your learning journey today.</div>
          <p className="text-white/50 text-lg">Personalized AI tutoring that adapts to your pace, style, and goals.</p>
          <div className="space-y-3">
            {["AI tutor that teaches visually and adapts to you", "Polymorphic learning — concepts shown 7 different ways", "Built-in spaced repetition & mastery tracking"].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/70">
                <div className="w-5 h-5 rounded-full bg-hexagon-accent/20 border border-hexagon-accent/40 flex items-center justify-center"><Check className="w-3 h-3 text-hexagon-accent" /></div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-white/30 text-sm">© 2026 HEXAGON</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-7">
          <div>
            <h1 className="text-3xl font-semibold text-hexagon-text-primary">Create your account</h1>
            <p className="text-hexagon-text-secondary mt-2">Free forever. No credit card required.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={clearError} className="ml-2 opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          <button
            onClick={loginWithGoogle}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-hexagon-surface border border-hexagon-border text-hexagon-text-primary rounded-xl px-4 py-3 font-medium hover:bg-hexagon-surface-hover transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-hexagon-border" />
            <span className="text-hexagon-text-secondary text-sm">or</span>
            <div className="flex-1 h-px bg-hexagon-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-hexagon-text-primary">Your name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Alex" required
                className="w-full bg-hexagon-surface border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary placeholder:text-hexagon-text-secondary/50 outline-none focus:border-hexagon-accent/60 transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-hexagon-text-primary">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full bg-hexagon-surface border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary placeholder:text-hexagon-text-secondary/50 outline-none focus:border-hexagon-accent/60 transition-colors" />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-hexagon-text-primary">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" required
                  className="w-full bg-hexagon-surface border border-hexagon-border rounded-xl px-4 py-3 pr-12 text-hexagon-text-primary placeholder:text-hexagon-text-secondary/50 outline-none focus:border-hexagon-accent/60 transition-colors" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-hexagon-text-secondary">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3].map(i => <div key={i} className={"h-1 flex-1 rounded-full transition-colors " + (i <= strength ? strengthColor : "bg-hexagon-border")} />)}
                  </div>
                  <span className="text-xs text-hexagon-text-secondary">{strengthLabel}</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-hexagon-accent text-black font-semibold rounded-xl py-3 hover:bg-hexagon-accent/90 transition-colors disabled:opacity-60">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create free account"}
            </button>
          </form>

          <p className="text-center text-hexagon-text-secondary text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-hexagon-accent hover:underline font-medium">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
