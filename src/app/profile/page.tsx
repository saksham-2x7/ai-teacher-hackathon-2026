"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, type Language, type TutorGender } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { LogOut, Save, ArrowLeft, Flame, Clock, BookOpen, User } from "lucide-react";
import Link from "next/link";

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner", desc: "I am new to this subject" },
  { value: "intermediate", label: "Intermediate", desc: "I have some foundational knowledge" },
  { value: "advanced", label: "Advanced", desc: "I want to deepen existing expertise" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "kn", label: "Kannada" },
  { value: "hinglish", label: "Hinglish" },
];

const TUTORS = [
  { id: "female", name: "ARIA", tagline: "Patient, warm, and Socratic", color: "from-purple-500/20 to-pink-500/10", accent: "purple" },
  { id: "male", name: "ALEX", tagline: "Direct, rigorous, and encouraging", color: "from-blue-500/20 to-cyan-500/10", accent: "blue" },
];

export default function ProfilePage() {
  const router = useRouter();
  const { profile, isAuthenticated, logout, updateProfile } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<{ name: string; language: Language; level: 'beginner'|'intermediate'|'advanced'; tutorGender: 'male'|'female' }>({ name: "", language: "en" as "en"|"hi"|"kn"|"hinglish", level: "intermediate" as "beginner"|"intermediate"|"advanced", tutorGender: "female" as "male"|"female" });

  useEffect(() => {
    if (!isAuthenticated) { router.replace("/login"); return; }
    if (profile) {
      // Defer state update to avoid sync setState warning
      setTimeout(() => {
        setForm({ name: profile.name, language: profile.language, level: profile.level, tutorGender: profile.tutorGender });
      }, 0);
    }
  }, [isAuthenticated, profile, router]);

  const handleSave = () => {
    updateProfile({ name: form.name, language: form.language as "en"|"hi"|"kn"|"hinglish", level: form.level as "beginner"|"intermediate"|"advanced", tutorGender: form.tutorGender as "male"|"female" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => { logout(); router.push("/login"); };

  const initials = form.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-hexagon-bg">
      <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
        <div className="flex items-center gap-4">
          <Link href="/home" className="w-9 h-9 rounded-xl border border-hexagon-border flex items-center justify-center text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <h1 className="text-2xl font-semibold text-hexagon-text-primary">Profile</h1>
        </div>

        {/* Avatar + Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-8 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-hexagon-accent/20 border-2 border-hexagon-accent/40 flex items-center justify-center text-hexagon-accent font-bold text-3xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-hexagon-text-primary">{profile.name}</h2>
            <p className="text-hexagon-text-secondary">{profile.email}</p>
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
              <div className="flex items-center gap-2 text-orange-400"><Flame className="w-4 h-4" /><span className="text-sm font-medium">{profile.streakDays} day streak</span></div>
              <div className="flex items-center gap-2 text-blue-400"><Clock className="w-4 h-4" /><span className="text-sm font-medium">{Math.round(profile.totalStudyMinutes/60)}h studied</span></div>
              <div className="flex items-center gap-2 text-hexagon-accent"><BookOpen className="w-4 h-4" /><span className="text-sm font-medium">23 lessons</span></div>
            </div>
          </div>
        </motion.div>

        {/* Edit Form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-8 space-y-7">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-hexagon-accent" />
            <h2 className="text-lg font-semibold text-hexagon-text-primary">Personal Information</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-hexagon-text-primary">Display Name</label>
              <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                className="w-full bg-hexagon-bg border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary outline-none focus:border-hexagon-accent/60 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-hexagon-text-primary">Language</label>
              <select value={form.language} onChange={e => setForm(f => ({...f, language: e.target.value as Language}))}
                className="w-full bg-hexagon-bg border border-hexagon-border rounded-xl px-4 py-3 text-hexagon-text-primary outline-none focus:border-hexagon-accent/60">
                {LANGUAGE_OPTIONS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-hexagon-text-primary">Learning Level</label>
            <div className="grid grid-cols-3 gap-3">
              {LEVEL_OPTIONS.map(l => (
                <button key={l.value} onClick={() => setForm(f => ({...f, level: l.value as "beginner"|"intermediate"|"advanced"}))}
                  className={"rounded-xl p-4 border text-left transition-all " + (form.level === l.value ? "border-hexagon-accent bg-hexagon-accent/5 text-hexagon-text-primary" : "border-hexagon-border text-hexagon-text-secondary hover:border-hexagon-border hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover")}>
                  <p className="font-medium text-sm">{l.label}</p>
                  <p className="text-xs mt-0.5 opacity-70">{l.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tutor Selection */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-hexagon-surface border border-hexagon-border rounded-2xl p-8 space-y-5">
          <h2 className="text-lg font-semibold text-hexagon-text-primary">Your AI Tutor</h2>
          <div className="grid grid-cols-2 gap-4">
            {TUTORS.map(t => (
              <button key={t.id} onClick={() => setForm(f => ({...f, tutorGender: t.id as "male"|"female"}))}
                className={"relative rounded-2xl p-6 border text-left transition-all bg-gradient-to-br " + t.color + " " + (form.tutorGender === t.id ? "border-hexagon-accent ring-1 ring-hexagon-accent/40" : "border-hexagon-border hover:border-hexagon-border")}>
                {form.tutorGender === t.id && <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-hexagon-accent flex items-center justify-center text-black text-xs font-bold">✓</div>}
                <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 mb-4 flex items-center justify-center text-2xl">{t.id === "female" ? "👩‍🏫" : "👨‍🏫"}</div>
                <p className="font-semibold text-hexagon-text-primary text-lg">{t.name}</p>
                <p className="text-hexagon-text-secondary text-sm mt-1">{t.tagline}</p>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300 font-medium transition-colors px-4 py-2 rounded-xl hover:bg-red-500/5">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <button onClick={handleSave} className={"flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all " + (saved ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-hexagon-accent text-black hover:bg-hexagon-accent/90")}>
            <Save className="w-4 h-4" />{saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
