"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto p-8 pt-12 space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-hexagon-text-primary">Settings</h1>
        <p className="text-hexagon-text-secondary text-lg">Manage your HEXAGON experience.</p>
      </header>

      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-xl font-medium text-hexagon-text-primary border-b border-hexagon-border pb-2">Appearance</h2>
          
          <div className="bg-hexagon-surface border border-hexagon-border rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-hexagon-text-primary">Theme</p>
              <p className="text-sm text-hexagon-text-secondary">Select your preferred color scheme.</p>
            </div>
            <div className="flex bg-hexagon-bg border border-hexagon-border rounded-lg p-1">
              <button 
                onClick={() => setTheme("light")}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'light' ? 'bg-hexagon-surface shadow-sm text-hexagon-accent' : 'text-hexagon-text-secondary hover:text-hexagon-text-primary'}`}
              >
                <Sun className="w-4 h-4" /> Light
              </button>
              <button 
                onClick={() => setTheme("dark")}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-hexagon-surface shadow-sm text-hexagon-accent' : 'text-hexagon-text-secondary hover:text-hexagon-text-primary'}`}
              >
                <Moon className="w-4 h-4" /> Dark
              </button>
              <button 
                onClick={() => setTheme("system")}
                className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-colors ${theme === 'system' ? 'bg-hexagon-surface shadow-sm text-hexagon-accent' : 'text-hexagon-text-secondary hover:text-hexagon-text-primary'}`}
              >
                <Monitor className="w-4 h-4" /> System
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-medium text-hexagon-text-primary border-b border-hexagon-border pb-2">AI Tutor Preferences</h2>
          
          <div className="bg-hexagon-surface border border-hexagon-border rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-hexagon-text-primary">Tutor Persona</p>
                <p className="text-sm text-hexagon-text-secondary">The cognitive style of your AI Teacher.</p>
              </div>
              <select className="bg-hexagon-bg border border-hexagon-border rounded-lg px-4 py-2 text-hexagon-text-primary outline-none focus:border-hexagon-accent">
                <option>Socratic (Default)</option>
                <option>Direct & Concise</option>
                <option>Encouraging</option>
                <option>Rigorous Academic</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-hexagon-text-primary">Voice Synthesis</p>
                <p className="text-sm text-hexagon-text-secondary">The voice used during immersive lessons.</p>
              </div>
              <select className="bg-hexagon-bg border border-hexagon-border rounded-lg px-4 py-2 text-hexagon-text-primary outline-none focus:border-hexagon-accent">
                <option>Nova (Natural)</option>
                <option>Echo (Deep)</option>
                <option>Shimmer (Clear)</option>
              </select>
            </div>
          </div>
        </section>
        
        <section className="pt-8">
           <button 
             onClick={() => {
               logout();
               router.push('/login');
             }}
             className="flex items-center gap-2 text-red-500 hover:text-red-400 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-red-500/10"
           >
             <LogOut className="w-5 h-5" /> Sign Out
           </button>
        </section>
      </div>
    </div>
  );
}
