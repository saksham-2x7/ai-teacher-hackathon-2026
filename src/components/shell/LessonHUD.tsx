'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Hexagon, Home, Plus, Sparkles } from 'lucide-react';
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

export default function LessonHUD() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { profile } = useAuthStore();
  const tutorGender = profile?.tutorGender || 'female';
  const { connectAudioElement, getAudioContext } = useAudioLipSync();
  const [chatError, setChatError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Unlock the shared AudioContext / auto-play on first interaction so TTS +
  // lip-sync actually fire (browsers block audio until a user gesture).
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
    useAIIntentStore.getState().setActiveQuestion(null);

    try {
      // Use a real backend session — create one on the spot if missing/stale
      let sessionId = sessionStorage.getItem('hexagon_session_id');
      if (!sessionId || sessionId.startsWith('session_local_')) {
        sessionId = await liveSSEClient.createSession(
          toFastAPILearnerProfile(profile, useAIIntentStore.getState().activeTopic)
        );
      }
      if (sessionId.startsWith('session_local_')) {
        throw new Error('The teacher backend is not reachable.');
      }

      // Use relative path for Next.js proxy -> Vercel Backend
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
        
        // Basic SSE parser
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
    <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="absolute top-0 left-0 right-0 p-5 flex justify-between items-center"
      >
        <Link href="/home" className="flex items-center gap-2.5 brut-btn brut-ink px-4 py-2.5 text-sm">
          <Hexagon className="w-5 h-5" /> <span className="font-black tracking-tight">HEXAGON</span>
        </Link>
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link href="/home" className="brut-btn brut-secondary px-4 py-2.5 text-xs flex items-center gap-1.5">
            <Home className="w-4 h-4" /> HOME
          </Link>
          <Link href="/setup" className="brut-btn brut-primary px-4 py-2.5 text-xs flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> NEW LESSON
          </Link>
        </div>
      </motion.div>

      {/* AI Teacher Chat Panel */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="absolute bottom-6 left-6 w-80 sm:w-96 flex flex-col pointer-events-auto h-[420px]"
      >
        <div className="flex-1 brut-card flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <div className="px-4 py-3 border-b-[3px] border-black bg-[#00E9FF] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-black" />
            <span className="text-xs font-black tracking-wider uppercase">Chat with your teacher</span>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex items-center justify-center text-center text-black/50 text-xs font-mono">
                  Ask your teacher a question, or reply to what you hear.
                </motion.div>
              ) : (
                messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full border-[2px] border-black flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-[#C4B5FD]' : 'bg-[#00FF9D]'}`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5 text-black" /> : <Bot className="w-3.5 h-3.5 text-black" />}
                    </div>
                    <div className={`text-sm px-3 py-2 rounded-xl max-w-[85%] font-semibold ${
                      msg.role === 'user' 
                        ? 'bg-[#C4B5FD] text-black rounded-tr-sm' 
                        : 'bg-black text-white rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))
              )}
              {isProcessing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full border-[2px] border-black flex items-center justify-center shrink-0 bg-[#00FF9D]">
                    <Bot className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="text-sm px-3 py-2 rounded-xl bg-black text-white flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-75" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce delay-150" />
                  </div>
                </motion.div>
              )}
              {chatError && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs px-3 py-2 rounded-xl bg-[#FF4D4D] text-white border-[2px] border-black font-bold"
                >
                  {chatError}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 border-t-[3px] border-black bg-white">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask a question or reply..."
                className="w-full brut-input py-3 pl-4 pr-12 text-sm font-bold"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={!input.trim() || isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-[8px] border-2 border-black bg-[#00FF9D] text-black flex items-center justify-center disabled:opacity-40 hover:bg-[#7CFFC0] transition-colors"
                title="Send (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}