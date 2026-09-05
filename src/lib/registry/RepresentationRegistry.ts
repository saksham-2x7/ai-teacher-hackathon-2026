import { ComponentType } from 'react';
import { RepresentationId, RepresentationMetadata, RepresentationProps } from '../../types/orchestration';
import dynamic from 'next/dynamic';

type RepresentationEntry = {
  metadata: RepresentationMetadata;
  component: ComponentType<RepresentationProps>;
};

const registry: Record<string, RepresentationEntry> = {
  webgl: {
    metadata: { id: 'webgl', name: 'Flow Chart', description: 'A colourful flowchart of the idea', capabilities: ['read', 'loop'] },
    component: dynamic(() => import('../../components/representations/WebGLRepresentation'), { ssr: false })
  },
  node: {
    metadata: { id: 'node', name: 'Concept Map', description: 'Map how ideas link together', capabilities: ['pan', 'zoom', 'drag', 'connect'] },
    component: dynamic(() => import('../../components/representations/NodeCanvasRepresentation'), { ssr: false })
  },
  graph: {
    metadata: { id: 'graph', name: 'Graph', description: 'Charts and number plots', capabilities: ['plot', 'hover', 'compare'] },
    component: dynamic(() => import('../../components/representations/GraphRepresentation'), { ssr: false })
  },
  timeline: {
    metadata: { id: 'timeline', name: 'Timeline', description: 'See the story unfold in order', capabilities: ['scroll', 'focus'] },
    component: dynamic(() => import('../../components/representations/TimelineRepresentation'), { ssr: false })
  },
  diagram: {
    metadata: { id: 'diagram', name: 'Diagram', description: 'Step-by-step labelled diagram', capabilities: ['read', 'step'] },
    component: dynamic(() => import('../../components/representations/DiagramRepresentation'), { ssr: false })
  },
  manipulation: {
    metadata: { id: 'manipulation', name: 'Hands-On Activity', description: 'Interactive drag-and-drop workspace', capabilities: ['drag', 'drop', 'assemble'] },
    component: dynamic(() => import('../../components/representations/ManipulationRepresentation'), { ssr: false })
  },
  code: {
    metadata: { id: 'code', name: 'Code Example', description: 'See it work step by step in a script', capabilities: ['read', 'scroll', 'execute'] },
    component: dynamic(() => import('../../components/representations/CodeRepresentation'), { ssr: false })
  },
  text: {
    metadata: { id: 'text', name: 'Structured Text', description: 'Textual explanation', capabilities: ['read', 'scroll'] },
    component: dynamic(() => import('../../components/representations/TextRepresentation'), { ssr: false })
  }
};

export function getRepresentation(id: RepresentationId): RepresentationEntry | undefined {
  return registry[id];
}

export function getAllRepresentations(): RepresentationEntry[] {
  return Object.values(registry);
}
