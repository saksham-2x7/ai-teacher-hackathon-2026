'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const TESTIMONIALS = [
  {
    quote: 'HEXAGON explained recursion in a way my professor never could. It switched to Hindi mid-session when it sensed I was struggling.',
    author: 'Priya Sharma',
    role: 'CS Student, IIT Bombay',
    initials: 'PS',
  },
  {
    quote: 'I went from beginner to shipping my first ML model in 6 weeks. The AI adapts faster than any human tutor I have had.',
    author: 'Rohan Mehta',
    role: 'Self-taught Engineer',
    initials: 'RM',
  },
];

const HexPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <pattern id="hex-login" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
        <polygon points="30,2 58,16 58,44 30,58 2,44 2,16" fill="none" stroke="#00FF9D" strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hex-login)" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, isAuthenticated, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/home');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => { clearError(); };
  }, [clearError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    clearError();
    try {
      await loginWithGoogle();
    } finally {
      setGoogleLoading(false);
    }
  };

  const testimonial = TESTIMONIALS[testimonialIndex];

  return (
    <div className="min-h-screen flex dark bg-[#050505] text-white">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-[#050505] via-[#0a1a12] to-[#050505]">
        <HexPattern />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#00FF9D]/5 blur-[120px] pointer-events-none" />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 flex items-center gap-3">
          <svg viewBox="0 0 36 42" fill="none" className="w-9 h-9">
            <path d="M18 1L34 10.5V31.5L18 41L2 31.5V10.5L18 1Z" stroke="#00FF9D" strokeWidth="1.5" fill="rgba(0,255,157,0.08)" />
            <path d="M18 10L26 14.5V23.5L18 28L10 23.5V14.5L18 10Z" fill="#00FF9D" opacity="0.6" />
          </svg>
          <span className="text-xl font-bold tracking-[0.2em] text-white">HEXAGON</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative z-10">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-[#00FF9D]" />
            <span className="text-xs font-medium tracking-widest text-[#00FF9D] uppercase">AI-Powered Learning</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight text-white mb-4">
            AI that teaches<br />
            <span className="text-[#00FF9D]">like a human.</span>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-md">
            Adaptive, multilingual, and brutally effective. HEXAGON senses how you learn and reshapes itself around you.
          </p>
          <div className="mt-10 flex gap-8">
            {[{ value: '94%', label: 'retention rate' }, { value: '6×', label: 'faster mastery' }, { value: '12+', label: 'languages' }].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-[#00FF9D]">{stat.value}</div>
                <div className="text-xs text-white/40 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.4 }} className="relative z-10">
          <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.03] backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIndex} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.4 }}>
                <p className="text-white/70 text-sm leading-relaxed italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00FF9D]/20 border border-[#00FF9D]/30 flex items-center justify-center text-[#00FF9D] text-xs font-bold">
                    {testimonial.initials}
                  </div>
                  <div>
                    <div className="text-white text-sm font-medium">{testimonial.author}</div>
                    <div className="text-white/40 text-xs">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="flex gap-1.5 mt-4">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setTestimonialIndex(i)} className={`h-1 rounded-full transition-all duration-300 ${i === testimonialIndex ? 'w-6 bg-[#00FF9D]' : 'w-1.5 bg-white/20'}`} aria-label={`Testimonial ${i + 1}`} />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <svg viewBox="0 0 36 42" fill="none" className="w-7 h-7">
            <path d="M18 1L34 10.5V31.5L18 41L2 31.5V10.5L18 1Z" stroke="#00FF9D" strokeWidth="1.5" fill="rgba(0,255,157,0.08)" />
            <path d="M18 10L26 14.5V23.5L18 28L10 23.5V14.5L18 10Z" fill="#00FF9D" opacity="0.6" />
          </svg>
          <span className="text-sm font-bold tracking-[0.2em] text-white">HEXAGON</span>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
            <p className="text-white/50 text-sm">Sign in to continue your learning journey.</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 mb-6">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={handleGoogle}
            disabled={isLoading || googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3.5 text-sm font-medium text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00FF9D]/40 focus:ring-offset-2 focus:ring-offset-[#050505]"
          >
            {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="relative my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/30 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-white/60 mb-2 uppercase tracking-wide">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  id="email" type="email" autoComplete="email" required
                  value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#00FF9D]/60 focus:ring-1 focus:ring-[#00FF9D]/30 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-medium text-white/60 uppercase tracking-wide">Password</label>
                <button type="button" className="text-xs text-[#00FF9D] hover:text-[#00FF9D]/80 transition-colors">Forgot password?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  id="password" type="password" autoComplete="current-password" required
                  value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:border-[#00FF9D]/60 focus:ring-1 focus:ring-[#00FF9D]/30 transition-all duration-200"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00FF9D] hover:bg-[#00FF9D]/90 active:scale-[0.98] px-5 py-3.5 text-sm font-semibold text-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00FF9D]/40 focus:ring-offset-2 focus:ring-offset-[#050505]"
            >
              {isLoading && !googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-white/40 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#00FF9D] hover:text-[#00FF9D]/80 font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
