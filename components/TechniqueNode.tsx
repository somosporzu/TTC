import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import type { Technique } from '../types';
import { FORCES, POWER_LEVELS } from '../constants';

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);
const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
    </svg>
);


const TechniqueNode: React.FC<NodeProps<Technique & { onDelete: (id: string) => void; onEdit: (id: string) => void }>> = ({ data }) => {
    const totalPcCost = data.effects.reduce((sum, effectInstance) => sum + effectInstance.finalCost, 0);
    const pcBudget = data.level ? POWER_LEVELS[data.level].pcBudget : 0;
    
    // FIX: Add a check for data.id before calling onDelete to handle the optional 'id' property.
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (data.id) {
            data.onDelete(data.id);
        }
    };
    
    // FIX: Add a check for data.id before calling onEdit to handle the optional 'id' property.
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (data.id) {
            data.onEdit(data.id);
        }
    };

    return (
        <div className="bg-slate-800 border-2 border-slate-600 rounded-lg w-64 shadow-lg p-3 relative group">
            <Handle type="target" position={Position.Top} className="!bg-orange-500" />
            
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={handleEdit} className="p-1 bg-slate-700 rounded-full text-slate-300 hover:bg-orange-500 hover:text-white">
                    <EditIcon />
                </button>
                 <button onClick={handleDelete} className="p-1 bg-slate-700 rounded-full text-slate-300 hover:bg-rose-500 hover:text-white">
                    <TrashIcon />
                </button>
            </div>

            <div className="font-bold text-orange-500 truncate">{data.name || 'Sin Nombre'}</div>
            <div className="text-xs text-slate-400 mb-2">{data.level || 'Nivel no definido'}</div>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-center">
                <div className="bg-slate-900/50 p-1 rounded">
                    <div className="text-slate-500">Fuerza</div>
                    <div className={`font-semibold ${data.force ? `text-${FORCES[data.force]?.color}-500` : ''}`}>{data.force || '-'}</div>
                </div>
                <div className="bg-slate-900/50 p-1 rounded">
                    <div className="text-slate-500">PC</div>
                    <div className={`font-semibold ${totalPcCost > pcBudget ? 'text-rose-500' : 'text-slate-200'}`}>{totalPcCost}/{pcBudget}</div>
                </div>
            </div>
            
            <Handle type="source" position={Position.Bottom} className="!bg-orange-500" />
        </div>
    );
};

export default memo(TechniqueNode);