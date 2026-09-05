'use client';
import { useCallback, useRef, useState, type ReactNode } from 'react';

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

/**
 * Mouse-wheel zoom (to cursor), pointer-drag pan, double-click reset.
 * No visible controls — the stage is always clean.
 */
export default function ZoomPanContainer({ children }: { children: ReactNode }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(1);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ startX: 0, startY: 0, panX: 0, panY: 0, active: false });

  const [isDragging, setIsDragging] = useState(false);

  const resetView = () => {
    panRef.current = { x: 0, y: 0 };
    zoomRef.current = 1;
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const factor = Math.exp(-e.deltaY * 0.002);
    const next = clamp(zoomRef.current * factor, MIN_ZOOM, MAX_ZOOM);
    if (next === zoomRef.current) return;

    const rect = boxRef.current?.getBoundingClientRect();
    const mx = e.clientX - (rect?.left ?? 0);
    const my = e.clientY - (rect?.top ?? 0);
    const ratio = next / zoomRef.current;

    panRef.current.x = mx - (mx - panRef.current.x) * ratio;
    panRef.current.y = my - (my - panRef.current.y) * ratio;
    zoomRef.current = next;
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

  const endDrag = useCallback(() => {
    dragRef.current.active = false;
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
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
          transform: `translate(${panRef.current.x}px, ${panRef.current.y}px) scale(${zoomRef.current})`,
          transformOrigin: '0 0'
        }}
      >
        {children}
      </div>
    </div>
  );
}