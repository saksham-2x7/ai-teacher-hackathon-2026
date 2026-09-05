"use client";

import { KeyRound, Trash2, ChevronLeft, Home } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useConfigStore } from "@/store/useConfigStore";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const { geminiApiKey, setGeminiApiKey } = useConfigStore();
  const [mounted, setMounted] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keySaved, setKeySaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setKeyInput(geminiApiKey);
  }, [geminiApiKey]);

  if (!mounted) return null;

  const hasKey = !!geminiApiKey.trim();

  function saveApiKey() {
    setGeminiApiKey(keyInput.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2200);
  }

  function resetAllData() {
    ["hexagon-auth", "hexagon-config"].forEach(key => localStorage.removeItem(key));
    sessionStorage.removeItem("hexagon_session_id");
    router.push("/home");
    window.location.reload();
  }

  return (
    <div className="min-h-screen brut-bg flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'url("/noise.svg")' }} />

      <div className="w-full max-w-lg relative z-10">
        <div className="flex items-center justify-between mb-4">
          <Link href="/home" className="brut-btn brut-secondary px-4 py-2 text-xs flex items-center gap-1.5">
            <Home className="w-4 h-4" /> HOME
          </Link>
          <Link href="/home" className="brut-btn brut-ink px-4 py-2 text-xs flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" /> BACK
          </Link>
        </div>

        <div className="brut-card p-6 space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-black">SETTINGS</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-black/60 mt-1">Your AI Teacher key &amp; reset</p>
          </div>

          {/* API KEY */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-black" />
              <label className="brut-tag">Your AI Teacher key</label>
            </div>
            <p className="text-sm font-semibold text-black/80">
              The app works out of the box on the shared classroom key. Paste your own key to power lessons with{" "}
              <em>your</em> account — it is sent straight to the lesson backend as <code className="font-mono">X-API-Key</code>{" "}
              and used only for your session.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && saveApiKey()}
                placeholder="Paste your API key (AIza…) or leave blank"
                autoComplete="off"
                className="brut-input flex-1 px-4 py-3 text-sm font-bold"
              />
              <button
                onClick={saveApiKey}
                disabled={!keyInput.trim()}
                className={`brut-btn px-6 py-3 text-sm ${keyInput.trim() ? "brut-primary" : ""}`}
              >
                {keySaved ? "SAVED" : "SAVE KEY"}
              </button>
            </div>
            <p className={`text-xs font-mono uppercase tracking-wider ${hasKey ? "text-black" : "text-black/50"}`}>
              Status: {hasKey ? "PERSONAL KEY SET — lessons will use it" : "NO KEY — shared classroom key in use"}
            </p>
            <p className="text-[11px] text-black/50">
              Stored only in this browser (localhost). Sent only to the lesson backend. Never logged.
            </p>
          </div>

          {/* RESET */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-black" />
              <label className="brut-tag" style={{ background: "#FF4D4D" }}>Reset everything</label>
            </div>
            <p className="text-sm font-semibold text-black/80">
              Clears your profile, saved key, and session from this browser.
            </p>
            <button
              onClick={() => {
                if (resetConfirm) resetAllData();
                else {
                  setResetConfirm(true);
                  setTimeout(() => setResetConfirm(false), 4000);
                }
              }}
              className="brut-btn w-full py-4 text-sm"
              style={{ background: "#FF4D4D" }}
            >
              {resetConfirm ? "TAP AGAIN TO CONFIRM" : "RESET ALL DATA"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}