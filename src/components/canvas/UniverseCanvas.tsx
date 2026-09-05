"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { useUniverseStore } from "@/store/useUniverseStore";

// Pre-allocated memory objects outside the useFrame loop (Strict 60 FPS rule)
const _targetPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _tempVec = new THREE.Vector3();

// Camera Director with smooth physics-based interpolation without GC allocations
function UniverseCameraDirector() {
  const cameraMode = useUniverseStore((s) => s.cameraMode);
  const targetY = cameraMode === "portrait" ? 1.4 : cameraMode === "classroom" ? 1.1 : 0.8;
  const targetZ = cameraMode === "portrait" ? 1.8 : cameraMode === "classroom" ? 2.6 : 3.4;

  useFrame((state, delta) => {
    _targetPos.set(0, targetY, targetZ);
    _targetLookAt.set(0, targetY - 0.2, 0);

    // Smooth lerp camera towards target frame
    state.camera.position.lerp(_targetPos, delta * 3.5);
    _tempVec.copy(_targetLookAt);
    state.camera.lookAt(_tempVec);
  });

  return null;
}

// Crystalline Polymorphic Core with dynamic audio reactivity
function PolymorphicCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const audioIntensity = useUniverseStore((s) => s.audioIntensity);
  const teacherState = useUniverseStore((s) => s.teacherState);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Constant rotation without allocating objects
    const speed = teacherState === "speaking" ? 1.8 : 0.6;
    meshRef.current.rotation.y += delta * speed;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.25;

    // Subtle breathing pulse based on audio intensity
    const targetScale = 1.0 + audioIntensity * 0.25;
    meshRef.current.scale.lerp(_tempVec.set(targetScale, targetScale, targetScale), delta * 5.0);
  });

  // Shader material / physical transmission
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#00f0ff"),
        emissive: new THREE.Color("#00283b"),
        roughness: 0.15,
        metalness: 0.85,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        wireframe: false,
      }),
    []
  );

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={[0, 0.9, 0]} material={material}>
        <icosahedronGeometry args={[0.7, 2]} />
      </mesh>
    </Float>
  );
}

export function UniverseCanvas() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          alpha: true,
        }}
        camera={{ position: [0, 1.2, 3.2], fov: 42 }}
        className="w-full h-full"
      >
        <color attach="background" args={["#030508"]} />

        {/* Cinematic Studio Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={2.2}
          color="#00f0ff"
          castShadow
          shadow-mapSize={1024}
        />
        <directionalLight
          position={[-4, 3, 2]}
          intensity={1.8}
          color="#a855f7"
        />
        <directionalLight
          position={[0, -2, -2]}
          intensity={0.6}
          color="#38bdf8"
        />

        {/* Ambient atmospheric floating particles */}
        <Sparkles count={80} scale={8} size={1.4} speed={0.3} color="#00f0ff" opacity={0.3} />

        {/* 3D Core Content */}
        <PolymorphicCore />

        {/* Grounding Contact Shadow */}
        <ContactShadows
          position={[0, -0.8, 0]}
          opacity={0.65}
          scale={7}
          blur={2.5}
          far={3}
          color="#000000"
        />

        <UniverseCameraDirector />
      </Canvas>
    </div>
  );
}
