'use client';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  label?: string;
  href?: string;
  className?: string;
}

/**
 * A small "back" button that returns to the previous page, or falls back to a
 * given route (default home) when there is no history to go back to.
 */
export default function BackButton({ label = 'Back', href = '/home', className = '' }: BackButtonProps) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(href);
    }
  }

  return (
    <button
      type="button"
      onClick={goBack}
      className={`inline-flex items-center gap-2 text-sm font-medium text-white/60 hover:text-white transition-colors ${className}`}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/10 transition-colors">
        <ArrowLeft className="w-4 h-4" />
      </span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}