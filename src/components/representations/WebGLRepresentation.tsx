'use client';
import { RepresentationProps } from '../../types/orchestration';
import MermaidDiagram from '../diagrams/MermaidDiagram';

const LESSON_FLOW = `flowchart LR
    A["You arrive"] --> B["Spark — a quick question"]
    B --> C["New idea, explained simply"]
    C --> D["See it work in a diagram"]
    D --> E["Your turn — a check"]
    E --> F["Practice together"]
    F --> G["Moving on"]`;

export default function WebGLRepresentation({ context: _context }: RepresentationProps) {
  return (
    <div className="w-full h-full bg-hexagon-dark">
      <MermaidDiagram chart={LESSON_FLOW} label="How your lesson flows" />
    </div>
  );
}