'use client';
import { useCallback, useRef, useState } from 'react';
import { Maximize2, Minus, Plus, RotateCcw } from 'lucide-react';

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Mouse-wheel zoom (to cursor), pointer-drag pan, double-click reset,
 * and +/-/reset controls — wraps any teaching visual.
 */
export default function ZoomPanContainer({ children }: { children: React.ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0, active: false });

  const [zoom, setZoomState] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  const setZoom = (v: number) => {
    zoomRef.current = v;
    setZoomState(v);
  };

  const resetView = () => {
    panRef.current = { x: 0, y: 0 };
    setZoom(1);
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const factor = Math.exp(-e.deltaY * 0.002);
    const next = clamp(zoomRef.current * factor, MIN_ZOOM, MAX_ZOOM);
    if (next === zoomRef.current) return;

    const rect = boxRef.current?.getBoundingClientRect();
    const mx = e.clientX - (rect?.left ?? 0);
    const my = e.clientY - (rect?.top ?? 0);
    const ratio = next / zoomRef.current;

    // Keep the point under the cursor stationary while zooming
    panRef.current.x = mx - (mx - panRef.current.x) * ratio;
    panRef.current.y = my - (my - panRef.current.y) * ratio;
    setZoom(next);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
      active: true
    };
    setIsDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    panRef.current.x = drag.panX + (e.clientX - drag.startX);
    panRef.current.y = drag.panY + (e.clientY - drag.startY);
  };

  const endDrag = () => {
    dragRef.current.active = false;
    setIsDragging(false);
  };

  const btn =
    'w-9 h-9 flex items-center justify-center rounded-xl bg-black/50 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all';

  return (
    <div
      ref={boxRef}
      className="relative w-full h-full overflow-hidden select-none"
      style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onDoubleClick={resetView}
    >
      <div
        className="absolute inset-0 origin-top-left"
        style={{
          transform: `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {children}
      </div>

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        <button title="Zoom out" className={btn} onClick={() => setZoom(clamp(zoomRef.current / 1.25, MIN_ZOOM, MAX_ZOOM))}>
          <Minus className="w-4 h-4" />
        </button>
        <span className="min-w-12 text-center text-xs font-mono text-white/70 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 backdrop-blur-md">
          {Math.round(zoom * 100)}%
        </span>
        <button title="Zoom in" className={btn} onClick={() => setZoom(clamp(zoomRef.current * 1.25, MIN_ZOOM, MAX_ZOOM))}>
          <Plus className="w-4 h-4" />
        </button>
        <button title="Reset view" className={btn} onClick={resetView}>
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-mono text-white/40 border border-white/5 bg-black/30 backdrop-blur-md">
          <Maximize2 className="w-3 h-3" /> scroll to zoom · drag to pan · double-click to reset
        </span>
      </div>
    </div>
  );
}