'use client';
import { useEffect, useId, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
  label?: string;
}

/**
 * Renders a Mermaid flowchart as inline SVG. SSR-safe: mermaid is loaded
 * lazily in the browser only (patterns used elsewhere in this app).
 */
export default function MermaidDiagram({ chart, label }: MermaidDiagramProps) {
  const reactId = useId();
  const chartId = `mermaid-${reactId.replace(/:/g, '')}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let disposed = false;

    async function render() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'strict',
          fontFamily: 'System-ui, sans-serif',
          themeVariables: {
            primaryColor: '#101623',
            primaryTextColor: '#E5E7EB',
            primaryBorderColor: '#4B5563',
            lineColor: '#94A3B8',
            secondaryColor: '#0A0D14',
            tertiaryColor: '#111827',
            clusterBkg: '#0F172A',
            clusterBorder: '#334155',
            edgeLabelBackground: '#111827',
            nodeBorder: '#6B7280',
          },
          flowchart: { nodeSpacing: 40, rankSpacing: 55, curve: 'basis', padding: 12 },
        });
        const { svg: rawSvg } = await mermaid.render(chartId, chart);
        if (!cancelled) {
          setSvg(rawSvg);
          setError(null);
        }
      } catch (e) {
        console.warn('Mermaid render failed:', e);
        if (!cancelled) setError(e instanceof Error ? e.message : 'Diagram failed to render');
      } finally {
        disposed = true;
      }
    }

    render();
    return () => {
      cancelled = true;
      if (!disposed) {
        // Best-effort cleanup for mermaid's injected SVG when it never resolved
      }
    };
  }, [chart, chartId]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 max-w-md">
          <p className="text-red-300 font-medium mb-1">Could not draw this diagram.</p>
          <pre className="text-xs text-red-200/80 whitespace-pre-wrap font-mono">{chart}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 overflow-auto">
      {label && <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium">{label}</span>}
      {svg ? (
        <div
          className="mermaid-rendered"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <div className="flex items-center gap-3 text-white/40 text-sm">
          <span className="w-5 h-5 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
          Drawing diagram…
        </div>
      )}
      <style>{`
        #${chartId} { width: 100%; height: auto; }
        #${chartId} svg { max-width: 100%; height: auto; }
        #${chartId} .node rect, #${chartId} .node polygon { rx: 14px; ry: 14px; }
      `}</style>
    </div>
  );
}