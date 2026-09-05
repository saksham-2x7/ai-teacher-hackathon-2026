"use client";
import { RepresentationProps } from '../../types/orchestration';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Line, Sphere, Text, Billboard } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import type { Line2 } from 'three-stdlib';
import { useInteractionStore } from '../../store/useInteractionStore';
import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';
import { useMemo, useRef, useState } from 'react';

// Neural Network Architecture
const LAYERS = [
  { id: 'input', nodes: 3, x: -3, color: '#4A90E2', label: 'Inputs' },
  { id: 'hidden1', nodes: 4, x: -1, color: '#9013FE', label: 'Hidden 1' },
  { id: 'hidden2', nodes: 4, x: 1, color: '#9013FE', label: 'Hidden 2' },
  { id: 'output', nodes: 2, x: 3, color: '#00FF9D', label: 'Output' }
];

function NeuralNode({ position, color, id, onInteract }: { position: [number, number, number], color: string, id: string, onInteract: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, hovered ? 1.5 : 1, 0.1)
      );
    }
  });

  return (
    <Sphere 
      ref={meshRef}
      args={[0.2, 32, 32]} 
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => { e.stopPropagation(); onInteract(id); }}
    >
      <meshPhysicalMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : 0.2}
        roughness={0.2}
        metalness={0.8}
        clearcoat={1}
        clearcoatRoughness={0.1}
        transmission={0.5}
        thickness={1}
      />
    </Sphere>
  );
}

function ConnectionLine({ start, end, active }: { start: [number, number, number], end: [number, number, number], active: boolean }) {
  const lineRef = useRef<Line2>(null);
  
  useFrame(() => {
    if (lineRef.current && active) {
      const material = lineRef.current.material as unknown as { dashOffset?: number };
      if (material && material.dashOffset !== undefined) {
        material.dashOffset -= 0.02;
      }
    }
  });

  return (
    <Line 
      ref={lineRef}
      points={[start, end]} 
      color={active ? "#00FF9D" : "rgba(255,255,255,0.1)"} 
      lineWidth={active ? 2 : 1}
      transparent
      opacity={active ? 0.8 : 0.2}
      dashed={active}
      dashSize={0.2}
      gapSize={0.1}
    />
  );
}

function NeuralNetwork() {
  const dispatchAction = useSemanticDispatcher(state => state.dispatchAction);
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const handleInteract = (id: string) => {
    setActiveNode(id);
    dispatchAction({ type: 'concept_selected', conceptId: id });
  };

  interface NodeItem {
    id: string;
    layerId: string;
    x: number;
    y: number;
    z: number;
    color: string;
  }

  interface ConnectionItem {
    id: string;
    source: NodeItem;
    target: NodeItem;
  }

  const nodes = useMemo(() => {
    const arr: NodeItem[] = [];
    LAYERS.forEach((layer) => {
      const yOffset = (layer.nodes - 1) * 0.8 / 2;
      for (let i = 0; i < layer.nodes; i++) {
        arr.push({
          id: `${layer.id}-${i}`,
          layerId: layer.id,
          x: layer.x,
          y: (i * 0.8) - yOffset,
          z: 0,
          color: layer.color
        });
      }
    });
    return arr;
  }, []);

  const connections = useMemo(() => {
    const arr: ConnectionItem[] = [];
    for (let l = 0; l < LAYERS.length - 1; l++) {
      const currLayerNodes = nodes.filter(n => n.layerId === LAYERS[l].id);
      const nextLayerNodes = nodes.filter(n => n.layerId === LAYERS[l+1].id);
      
      currLayerNodes.forEach(c => {
        nextLayerNodes.forEach(n => {
          arr.push({
            id: `${c.id}_${n.id}`,
            source: c,
            target: n
          });
        });
      });
    }
    return arr;
  }, [nodes]);

  return (
    <group position={[0, 0.5, 0]}>
      {connections.map((conn) => (
        <ConnectionLine 
          key={conn.id} 
          start={[conn.source.x, conn.source.y, conn.source.z]} 
          end={[conn.target.x, conn.target.y, conn.target.z]} 
          active={activeNode === conn.source.id || activeNode === conn.target.id}
        />
      ))}
      
      {nodes.map((node) => (
        <NeuralNode 
          key={node.id} 
          id={node.id}
          position={[node.x, node.y, node.z]} 
          color={activeNode === node.id ? '#ffffff' : node.color} 
          onInteract={handleInteract}
        />
      ))}

      {LAYERS.map(layer => (
        <Billboard key={`label-${layer.id}`} position={[layer.x, 2.5, 0]}>
          <Text fontSize={0.3} color="#ffffff" fillOpacity={0.6} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf">
            {layer.label}
          </Text>
        </Billboard>
      ))}
    </group>
  );
}

function ParallaxCamera() {
  useFrame((state) => {
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, state.pointer.x * 1, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, state.pointer.y * 1, 0.05);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function WebGLRepresentation({ context: _context }: RepresentationProps) {
  const setCameraAngle = useInteractionStore((state) => state.setCameraAngle);

  return (
    <div className="w-full h-full bg-hexagon-dark">
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 45 }}
        onCreated={({ camera }) => setCameraAngle(camera.rotation.y)}
      >
        <ambientLight intensity={0.2} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#4A90E2" />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#E24A90" />
        <Environment files="/potsdamer_platz_1k.hdr" />
        
        <NeuralNetwork />

        <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={20} blur={2} far={4} color="#00FF9D" />
        
        <ParallaxCamera />

        <EffectComposer>
          <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.4} />
          <Vignette eskil={false} offset={0.1} darkness={1.2} />
        </EffectComposer>

        <OrbitControls 
          enableDamping 
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
          onChange={(e) => {
            if (e?.target?.object) {
              setCameraAngle(e.target.object.rotation.y);
            }
          }}
        />
      </Canvas>
    </div>
  );
}
