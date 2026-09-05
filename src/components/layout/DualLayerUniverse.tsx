"use client";

import React from "react";
import { UniverseCanvas } from "@/components/canvas/UniverseCanvas";
import { UniverseOverlay } from "@/components/overlay/UniverseOverlay";

interface DualLayerUniverseProps {
  children?: React.ReactNode;
}

/**
 * DualLayerUniverse: The Universe-Class Dual-Layer Architecture
 * - Layer 1 (Underneath): Fixed 60FPS WebGL R3F Canvas with cinematic lighting & GLSL materials
 * - Layer 2 (Overlay): Butter-smooth 2D DOM HUD with pointer-events isolation & Framer Motion micro-interactions
 */
export function DualLayerUniverse({ children }: DualLayerUniverseProps) {
  return (
    <div className="relative w-full min-h-screen bg-[#030508] overflow-x-hidden">
      {/* Layer 1: 3D WebGL Canvas underneath */}
      <UniverseCanvas />

      {/* Layer 2: 2D Interactive UI Overlay on top */}
      <UniverseOverlay>
        {children}
      </UniverseOverlay>
    </div>
  );
}
