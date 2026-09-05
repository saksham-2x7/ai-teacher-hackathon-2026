'use client';

export interface FlowNode {
  id: string;
  label: string;
  detail?: string;
  accent?: string; // tailwind gradient classes, e.g. 'from-emerald-500 to-teal-400'
}

export interface FlowEdge {
  from: string;
  to: string;
}

interface HtmlFlowChartProps {
  title?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  order?: string[]; // explicit display order (left -> right columns are inferred from edges otherwise)
}

const FALLBACK_ACCENTS = [
  'from-emerald-500 to-teal-400',
  'from-sky-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-amber-500 to-orange-400',
  'from-rose-500 to-pink-400',
  'from-lime-500 to-green-400',
];

/**
 * Lightweight HTML-generated flowchart. No canvas, no WebGL — coloured cards
 * connected by animated arrows, driven by data.
 */
export default function HtmlFlowChart({ title, nodes, edges, order }: HtmlFlowChartProps) {
  // Longest-path layering so branched flows still read left -> right.
  const layers = buildLayers(nodes, edges, order);
  const maxColumns = Math.max(1, ...layers.map((l) => l.length));
  const maxDepth = layers.length;

  function accentFor(node: FlowNode, index: number): string {
    return node.accent ?? FALLBACK_ACCENTS[index % FALLBACK_ACCENTS.length];
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6 overflow-auto">
      {title && (
        <span className="text-xs uppercase tracking-[0.2em] text-white/40 font-medium">{title}</span>
      )}

      <div
        className="grid gap-x-6 gap-y-0 items-center max-w-4xl w-full"
        style={{ gridTemplateColumns: `repeat(${maxColumns}, minmax(0, 1fr))`, gridAutoRows: 'min-content' }}
      >
        {layers.map((layer, depth) => (
          <div
            key={depth}
            className="contents"
          >
            {layer.map((nodeId, idx) => {
              const node = nodes.find((n) => n.id === nodeId)!;
              const accent = accentFor(node, idx + depth);
              const incoming = edges.filter((e) => e.to === nodeId).length;
              return (
                <div
                  key={node.id}
                  className="flow-card"
                  style={{ gridColumn: depth + 1, animationDelay: `${(depth * 3 + idx) * 80}ms` }}
                >
                  <div className={`bg-gradient-to-br ${accent} rounded-[22px] p-px shadow-[0_10px_40px_-12px_rgba(0,0,0,0.7)]`}>
                    <div className="rounded-[21px] bg-[#0B0E14]/95 backdrop-blur px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`relative flex h-2.5 w-2.5 shrink-0`}>
                          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-gradient-to-br ${accent}`} />
                          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-gradient-to-br ${accent}`} />
                        </span>
                        <p className="text-white text-sm font-semibold">{node.label}</p>
                        {incoming > 1 && (
                          <span className="ml-auto text-[10px] uppercase tracking-wider text-white/30">merge</span>
                        )}
                      </div>
                      {node.detail && (
                        <p className="mt-2 pl-5 text-xs text-white/50 leading-relaxed">{node.detail}</p>
                      )}
                    </div>
                  </div>

                  {depth < maxDepth - 1 && (
                    <div className="flex justify-center py-1.5">
                      <svg width="90" height="28" viewBox="0 0 90 28" fill="none" className="opacity-70">
                        <path
                          d="M12 14 H64 M56 6 L66 14 L56 22"
                          stroke="url(#flowArrowGrad)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <defs>
                          <linearGradient id="flowArrowGrad" x1="0" y1="0" x2="90" y2="0" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#34D399" />
                            <stop offset="1" stopColor="#818CF8" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <style>{`
        .flow-card {
          opacity: 0;
          animation: flow-card-in 0.5s ease forwards;
        }
        @keyframes flow-card-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function buildLayers(nodes: FlowNode[], edges: FlowEdge[], order?: string[]): string[][] {
  const idSet = new Set(nodes.map((n) => n.id));
  const outEdges = new Map<string, string[]>();
  const inDegree = new Map<string, number>();
  nodes.forEach((n) => {
    outEdges.set(n.id, []);
    inDegree.set(n.id, 0);
  });
  edges.forEach((e) => {
    if (!idSet.has(e.from) || !idSet.has(e.to)) return;
    outEdges.get(e.from)!.push(e.to);
    inDegree.set(e.to, (inDegree.get(e.to) ?? 0) + 1);
  });

  const layerByNode = new Map<string, number>();
  if (order && order.length) {
    order.forEach((id, i) => layerByNode.set(id, i));
    // Place any leftover nodes on a right-most layer instead of dropping them
    nodes.forEach((n) => {
      if (!layerByNode.has(n.id)) layerByNode.set(n.id, order.length);
    });
  } else {
    let depth = 0;
    let frontier = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0);
    if (!frontier.length) frontier = nodes.slice(0, 1);
    while (frontier.length) {
      frontier.forEach((n) => {
        if (!layerByNode.has(n.id)) layerByNode.set(n.id, depth);
        outEdges.get(n.id)!.forEach((next) => {
          const nextNode = nodes.find((nn) => nn.id === next);
          if (nextNode && !layerByNode.has(next)) {
            layerByNode.set(next, depth + 1);
          }
        });
      });
      depth += 1;
      const nextSet = new Set<string>();
      frontier.forEach((n) => outEdges.get(n.id)!.forEach((t) => nextSet.add(t)));
      frontier = Array.from(nextSet)
        .map((id) => nodes.find((nn) => nn.id === id))
        .filter((n): n is FlowNode => !!n && !layerByNode.has(n.id));
    }
    // Anything not reached (e.g. unconnected) sits at depth
    nodes.forEach((n) => {
      if (!layerByNode.has(n.id)) layerByNode.set(n.id, depth);
    });
  }

  const maxDepth = Math.max(0, ...layerByNode.values());
  const cols = Array.from({ length: maxDepth + 1 }, () => [] as string[]);
  layerByNode.forEach((d, id) => cols[d].push(id));
  return cols;
}