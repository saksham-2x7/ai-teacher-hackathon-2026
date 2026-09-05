'use client';
import { RepresentationProps } from '../../types/orchestration';
import HtmlFlowChart from '../diagrams/HtmlFlowChart';

const PHOTOSYNTHESIS_NODES = [
  { id: 'sun', label: 'Sunlight', detail: 'Energy arrives on the leaf' },
  { id: 'chlorophyll', label: 'Chlorophyll', detail: 'Green pigment in the leaves catches the light energy' },
  { id: 'inputs', label: 'Water + Carbon Dioxide', detail: 'The plant draws water from its roots and CO₂ from the air' },
  { id: 'glucose', label: 'Glucose is Built', detail: 'Light energy joins carbon dioxide and water into sugar' },
  { id: 'oxygen', label: 'Oxygen is Released', detail: 'The plant lets oxygen out through its leaves' },
];

const PHOTOSYNTHESIS_EDGES = [
  { from: 'sun', to: 'chlorophyll' },
  { from: 'chlorophyll', to: 'inputs' },
  { from: 'inputs', to: 'glucose' },
  { from: 'glucose', to: 'oxygen' },
];

export default function DiagramRepresentation({ context }: RepresentationProps) {
  const topic = context.topic || 'Photosynthesis';
  const title = context.visualTitle || `${topic} — step by step`;
  const isPhotosynthesis = /photosynth/i.test(topic);

  const nodes = isPhotosynthesis ? PHOTOSYNTHESIS_NODES : [
    { id: 'start', label: `Meet ${topic}`, detail: 'The big idea, introduced simply' },
    { id: 'core', label: 'Core concept', detail: 'The key parts of the idea and how they connect' },
    { id: 'worked', label: 'See it in action', detail: `A concrete example of ${topic}` },
    { id: 'why', label: 'Why it matters', detail: `Where ${topic} shows up in the real world` },
    { id: 'check', label: 'Quick check', detail: 'A question to confirm it has clicked' },
  ];

  const edges = isPhotosynthesis ? PHOTOSYNTHESIS_EDGES : [
    { from: 'start', to: 'core' },
    { from: 'core', to: 'worked' },
    { from: 'worked', to: 'why' },
    { from: 'why', to: 'check' },
  ];

  return (
    <div className="w-full h-full bg-hexagon-dark">
      <HtmlFlowChart title={title} nodes={nodes} edges={edges} />
    </div>
  );
}