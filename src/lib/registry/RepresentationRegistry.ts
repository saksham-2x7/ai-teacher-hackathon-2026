import { ComponentType } from 'react';
import { RepresentationId, RepresentationMetadata, RepresentationProps } from '../../types/orchestration';
import dynamic from 'next/dynamic';

type RepresentationEntry = {
  metadata: RepresentationMetadata;
  component: ComponentType<RepresentationProps>;
};

const registry: Record<string, RepresentationEntry> = {
  webgl: {
    metadata: { id: 'webgl', name: '3D Simulation', description: 'Interactive WebGL environment', capabilities: ['orbit', 'zoom', 'focus'] },
    component: dynamic(() => import('../../components/representations/WebGLRepresentation'), { ssr: false })
  },
  node: {
    metadata: { id: 'node', name: 'Concept Graph', description: 'Node-based concept mapping', capabilities: ['pan', 'zoom', 'drag', 'connect'] },
    component: dynamic(() => import('../../components/representations/NodeCanvasRepresentation'), { ssr: false })
  },
  graph: {
    metadata: { id: 'graph', name: 'Data Graph', description: '2D mathematical and data plotting', capabilities: ['plot', 'hover', 'compare'] },
    component: dynamic(() => import('../../components/representations/GraphRepresentation'), { ssr: false })
  },
  timeline: {
    metadata: { id: 'timeline', name: 'Chronological Timeline', description: 'Event sequence visualization', capabilities: ['scroll', 'focus'] },
    component: dynamic(() => import('../../components/representations/TimelineRepresentation'), { ssr: false })
  },
  diagram: {
    metadata: { id: 'diagram', name: 'System Diagram', description: 'Structured visual diagram', capabilities: ['pan', 'zoom', 'highlight'] },
    component: dynamic(() => import('../../components/representations/DiagramRepresentation'), { ssr: false })
  },
  manipulation: {
    metadata: { id: 'manipulation', name: 'Direct Manipulation', description: 'Interactive drag-and-drop workspace', capabilities: ['drag', 'drop', 'assemble'] },
    component: dynamic(() => import('../../components/representations/ManipulationRepresentation'), { ssr: false })
  },
  code: {
    metadata: { id: 'code', name: 'Code Demonstration', description: 'Code execution and architecture diagram', capabilities: ['read', 'scroll', 'execute'] },
    component: dynamic(() => import('../../components/representations/CodeRepresentation'), { ssr: false })
  },
  text: {
    metadata: { id: 'text', name: 'Structured Text', description: 'Textual explanation fallback', capabilities: ['read', 'scroll'] },
    component: dynamic(() => import('../../components/representations/TextRepresentation'), { ssr: false })
  }
};

export function getRepresentation(id: RepresentationId): RepresentationEntry | undefined {
  return registry[id];
}

export function getAllRepresentations(): RepresentationEntry[] {
  return Object.values(registry);
}
