'use client';
import { RepresentationProps } from '../../types/orchestration';
import { useCallback, useState, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
  Handle,
  Position
} from 'reactflow';

import { useSemanticDispatcher } from '../../lib/api/useSemanticDispatcher';
import { motion } from 'framer-motion';

// Custom Node Component
const PremiumNode = ({ data }: { data: { label: string } }) => (
  <motion.div 
    whileHover={{ scale: 1.05, y: -4 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className="bg-hexagon-surface backdrop-blur-md border-2 border-white/10 rounded-xl p-4 text-white shadow-lg transition-colors hover:border-hexagon-accent min-w-[140px] text-center font-medium"
  >
    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-white border-none" />
    {data.label}
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-hexagon-accent border-none" />
  </motion.div>
);

const nodeTypes = { premium: PremiumNode };

const initialNodes: Node[] = [
  { id: 'A', type: 'premium', position: { x: 250, y: 100 }, data: { label: 'Glycolysis' } },
  { id: 'B', type: 'premium', position: { x: 100, y: 300 }, data: { label: 'Krebs Cycle' } },
  { id: 'C', type: 'premium', position: { x: 400, y: 300 }, data: { label: 'Electron Transport' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'A', target: 'B', animated: true, style: { stroke: 'rgba(255,255,255,0.6)', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' } },
  { id: 'e1-3', source: 'A', target: 'C', animated: true, style: { stroke: 'rgba(255,255,255,0.6)', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' } },
];

const defaultEdgeOptions = {
  animated: true,
  style: { stroke: 'rgba(255,255,255,0.8)', strokeWidth: 2, filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' },
};

export default function NodeCanvasRepresentation({ context: _context }: RepresentationProps) {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const dispatchAction = useSemanticDispatcher((state) => state.dispatchAction);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
      if (params.source && params.target) {
        dispatchAction({
          type: 'NODE_CONNECTED',
          source: params.source,
          target: params.target
        });
      }
    },
    [dispatchAction]
  );

  return (
    <div className="w-full h-full bg-transparent relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        className="bg-transparent"
      >
        <Background color="#00FF9D" gap={24} size={1} style={{ opacity: 0.1 }} />
        <MiniMap nodeColor="#00FF9D" maskColor="rgba(0,0,0,0.7)" style={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }} />
        <Controls 
          style={{ display: 'flex', flexDirection: 'column', gap: '4px', backgroundColor: 'transparent', boxShadow: 'none', border: 'none' }} 
          className="[&>button]:bg-hexagon-surface [&>button]:backdrop-blur-md [&>button]:border [&>button]:border-white/10 [&>button]:text-white [&>button]:rounded-md hover:[&>button]:text-hexagon-accent" 
        />
      </ReactFlow>
    </div>
  );
}
