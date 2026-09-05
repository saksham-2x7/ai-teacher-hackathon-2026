'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Hexagon, Home, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAIIntentStore } from '../../store/useAIIntentStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAudioLipSync } from '../../hooks/useAudioLipSync';
import { liveSSEClient, mapBackendTeacherState, mapBackendVisualType, mapInteractivePromptToQuestion } from '../../services/liveSSEClient';
import { toFastAPILearnerProfile } from '../../utils/toFastAPILearnerProfile';
import Link from 'next/link';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

/* Brutal top bar */
export default function LessonHUD() {
  return (
    <header data-slot="header" className="shrink-0 flex items-center justify-between px-4 py-3">
      <Link href="/home" className="brut-btn brut-ink px-4 py-2.5 text-sm flex items-center gap-2">
        <Hexagon className="w-5 h-5" /> <span className="font-black tracking-tight">HEXAGON</span>
      </Link>
      <nav className="flex items-center gap-2">
        <Link href="/home" className="brut-btn brut-secondary px-4 py-2.5 text-xs flex items-center gap-1.5">
          <Home className="w-4 h-4" /> HOME
        </Link>
        <Link href="/setup" className="brut-btn brut-primary px-4 py-2.5 text-xs flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> NEW LESSON
        </Link>
      </nav>
    </header>
  );
}

/* Brutal terminal chat footer */
export function LessonChatFooter() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { profile } = useAuthStore();
  const { getAudioContext } = useAudioLipSync();
  const [chatError, setChatError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Unlock the shared AudioContext on first interaction so TTS + lip-sync fire
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      getAudioContext()?.resume().catch(() => {});
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, [getAudioContext]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userMsg }]);
    setIsProcessing(true);
    setChatError(null);

    try {
      let sessionId = sessionStorage.getItem('hexagon_session_id');
      if (!sessionId || sessionId.startsWith('session_local_')) {
        sessionId = await liveSSEClient.createSession(
          toFastAPILearnerProfile(profile, useAIIntentStore.getState().activeTopic)
        );
      }
      if (sessionId.startsWith('session_local_')) {
        throw new Error('The teacher backend is not reachable.');
      }

      const res = await fetch(`/api/v1/sessions/${sessionId}/interact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_input: userMsg })
      });

      if (!res.ok) throw new Error(`Backend replied ${res.status}`);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);

        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              const text = data.spoken_text || data.message || '';
              if (text) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text }]);
                useAIIntentStore.getState().setTeacherState(mapBackendTeacherState(data.state), text);
              }
              if (data.visual_intent) {
                const repr = mapBackendVisualType(data.visual_intent.type);
                if (repr) useAIIntentStore.getState().setRepresentation(repr);
              }
              const question = mapInteractivePromptToQuestion(data.interactive_prompt);
              if (question) useAIIntentStore.getState().setActiveQuestion(question);
            } catch (err) {}
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatError(error instanceof Error ? error.message : 'Failed to send message. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <footer data-slot="footer" className="shrink-0 px-4 pb-4">
      <div className="brut-card bg-white p-3 flex flex-col gap-2">
        <div ref={scrollRef} className="max-h-32 overflow-y-auto space-y-2">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <p className="text-[11px] font-mono uppercase tracking-widest text-black/50">
                Ask your teacher a question — or reply to what you hear.
              </p>
            )}
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <span className={`w-6 h-6 rounded-md border-2 border-black flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#C4B5FD]' : 'bg-[#00E9FF]'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-black" /> : <Bot className="w-3.5 h-3.5 text-black" />}
                </span>
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-lg max-w-[75%] break-words ${
                  msg.role === 'user' ? 'bg-[#C4B5FD] text-black' : 'bg-black text-white'
                }`}>
                  {msg.text}
                </span>
              </motion.div>
            ))}
            {isProcessing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md border-2 border-black flex items-center justify-center bg-[#00E9FF]">
                  <Bot className="w-3.5 h-3.5 text-black" />
                </span>
                <span className="flex gap-1 px-2 py-1.5 rounded-lg bg-black">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:75ms]" />
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:150ms]" />
                </span>
              </motion.div>
            )}
            {chatError && (
              <p className="text-xs font-bold px-3 py-2 rounded-lg bg-[#FF4D4D] text-white border-2 border-black">
                {chatError}
              </p>
            )}
          </AnimatePresence>
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question or reply..."
            className="brut-input flex-1 px-4 py-3 text-sm font-bold min-w-0"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="brut-btn brut-primary w-11 h-11 shrink-0 flex items-center justify-center"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </footer>
  );
}