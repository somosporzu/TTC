import React, { useMemo, useCallback } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Connection,
  type Edge,
} from 'reactflow';

import type { Technique } from '../types';
import TechniqueNode from './TechniqueNode';

interface TechniqueTreeViewProps {
    techniques: Technique[];
    onSetParent: (childId: string, parentId: string) => void;
    onDeleteTechnique: (techniqueId: string) => void;
    onEditTechnique: (techniqueId: string) => void;
}

const nodeTypes = {
  technique: TechniqueNode,
};

// Simple auto-layout logic
const getLayoutedElements = (techniques: Technique[]) => {
    // FIX: Filter techniques to ensure they have an ID before creating nodes.
    // This prevents errors with ReactFlow, which requires a string ID for each node.
    const nodes = techniques.filter(tech => tech.id).map((tech, i) => ({
        id: tech.id!,
        type: 'technique',
        position: { x: (i % 4) * 300, y: Math.floor(i / 4) * 200 },
        // FIX: The placeholder functions for onDelete and onEdit now accept an `id` parameter
        // to match the expected signature `(id: string) => void`. This resolves a TypeScript
        // type inference issue with the `useNodesState` hook.
        data: { ...tech, onDelete: (id: string) => {}, onEdit: (id: string) => {} },
    }));

    // FIX: Filter techniques to ensure they have both a parentId and an id before creating edges.
    const edges = techniques
        .filter(tech => tech.parentId && tech.id)
        .map(tech => ({
            id: `e-${tech.parentId!}-${tech.id!}`,
            source: tech.parentId!,
            target: tech.id!,
            animated: true,
            style: { stroke: '#f97316' },
        }));

    return { nodes, edges };
};


const TechniqueTreeView: React.FC<TechniqueTreeViewProps> = ({ techniques, onSetParent, onDeleteTechnique, onEditTechnique }) => {
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => getLayoutedElements(techniques), [techniques]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    
    // Update nodes data when onDelete or onEdit handlers change
    React.useEffect(() => {
        setNodes(prevNodes => prevNodes.map(node => ({
            ...node,
            data: {
                ...node.data,
                onDelete: onDeleteTechnique,
                onEdit: onEditTechnique
            }
        })));
    }, [onDeleteTechnique, onEditTechnique, setNodes, techniques]);


    const onConnect = useCallback(
        (params: Connection) => {
            if (params.source && params.target) {
                onSetParent(params.target, params.source);
                setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#f97316' } }, eds));
            }
        },
        [setEdges, onSetParent]
    );

    return (
        <div style={{ height: '75vh' }} className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-lg shadow-lg">
             {techniques.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <p className="text-slate-400">Aún no has guardado ninguna técnica. ¡Ve al Creador para empezar!</p>
                </div>
            ) : (
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-slate-900/50"
                >
                    <Background color="#475569" gap={16} />
                    <Controls />
                    <MiniMap nodeColor={n => '#f97316'} nodeStrokeWidth={3} zoomable pannable />
                </ReactFlow>
            )}
        </div>
    );
};

export default TechniqueTreeView;