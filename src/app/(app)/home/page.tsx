"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hexagon, ArrowRight, Sparkles, Settings } from "lucide-react";
import { useConfigStore } from "@/store/useConfigStore";

const EXAMPLE_PROMPTS = [
  "Teach me photosynthesis step by step",
  "Explain black holes simply",
  "Help me understand fractions",
  "Teach me Newton's laws of motion",
  "Explain how electricity works",
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const geminiApiKey = useConfigStore(s => s.geminiApiKey);

  useEffect(() => {
    const t = setInterval(() => setPromptIdx(i => (i + 1) % EXAMPLE_PROMPTS.length), 2600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleStart = () => {
    const q = query.trim();
    router.push(q ? `/setup?topic=${encodeURIComponent(q)}` : "/setup");
  };

  return (
    <div className="min-h-screen brut-bg flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'url("/noise.svg")' }} />

      <div className="w-full max-w-2xl space-y-8 relative z-10">
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <span className="w-14 h-14 brut-card brut-hex flex items-center justify-center rotate-45 -translate-y-2">
              <Hexagon className="w-7 h-7 -rotate-45 text-black" />
            </span>
            <h1 className="text-6xl font-black tracking-tighter text-black">
              HEXAGON
            </h1>
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-black/70">
            Your AI teacher. Live. Out loud.
          </p>
        </div>

        <div className="brut-card p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-black" />
            <span className="brut-tag">New lesson</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleStart(); }}
            placeholder={EXAMPLE_PROMPTS[promptIdx]}
            className="brut-input w-full px-5 py-4 text-lg font-bold"
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-bold uppercase tracking-wider text-black/60">
              Press Enter or hit Start
            </p>
            <button onClick={handleStart} className="brut-btn brut-primary px-8 py-4 text-lg flex items-center gap-2">
              START <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-center text-[11px] font-mono uppercase tracking-widest text-black/50">
          The 3D teacher speaks. You learn. That's it.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link href="/settings" className="brut-btn brut-secondary px-4 py-2.5 text-xs flex items-center gap-1.5">
            <Settings className="w-4 h-4" /> SETTINGS
          </Link>
          <Link href="/settings" className="brut-btn brut-ink px-4 py-2.5 text-xs flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${geminiApiKey ? "bg-[#00FF9D]" : "bg-[#FF4D4D]"}`} />
            {geminiApiKey ? "API KEY SET" : "SHARED KEY"}
          </Link>
        </div>
      </div>
    </div>
  );
}