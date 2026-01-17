import React, { forwardRef } from 'react';
import type { Technique } from '../types';
import { FORCES } from '../constants';

interface TechniqueCardProps {
  technique: Technique;
  totalPcCost: number;
  pcBudget: number;
  removeEffect: (instanceId: string) => void;
}

const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    const barColor = percentage > 100 ? 'bg-rose-500' : 'bg-orange-500';
    return (
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div 
                className={`${barColor} h-2.5 rounded-full transition-all duration-300`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
        </div>
    );
};

const RemoveIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const TechniqueCard = forwardRef<HTMLDivElement, TechniqueCardProps>(({ technique, totalPcCost, pcBudget, removeEffect }, ref) => {
  return (
    <div ref={ref} className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 rounded-lg p-6 shadow-lg space-y-4">
      <div className="flex justify-between items-center border-b-2 border-slate-700 pb-3">
        <h3 className="text-2xl font-bold text-center text-slate-200">Técnica Resultante</h3>
      </div>
      
      <div>
        <h4 className="font-bold text-lg text-orange-500">{technique.name || "Nombre de la Técnica"}</h4>
        <p className="text-sm italic text-slate-400">{technique.description || "Descripción narrativa de la técnica."}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-slate-900/50 p-3 rounded-md">
            <div className="text-xs text-slate-400">Nivel</div>
            <div className="font-bold text-lg text-slate-200">{technique.level || '-'}</div>
        </div>
        <div className="bg-slate-900/50 p-3 rounded-md">
            <div className="text-xs text-slate-400">Coste Resistencia</div>
            <div className="font-bold text-lg text-slate-200">{technique.level ? technique.resistanceCost : '-'}</div>
        </div>
         <div className="bg-slate-900/50 p-3 rounded-md">
            <div className="text-xs text-slate-400">Fuerza</div>
            <div className={`font-bold text-lg ${technique.force ? `text-${FORCES[technique.force].color}-500` : 'text-slate-200'}`}>{technique.force || '-'}</div>
        </div>
         <div className="bg-slate-900/50 p-3 rounded-md">
            <div className="text-xs text-slate-400">PC Gastados</div>
            <div className={`font-bold text-lg ${totalPcCost > pcBudget ? 'text-rose-600' : 'text-slate-200'}`}>{totalPcCost} / {pcBudget}</div>
        </div>
      </div>

      {technique.level && (
          <div>
            <ProgressBar value={totalPcCost} max={pcBudget} />
             {totalPcCost > pcBudget && <p className="text-xs text-rose-600 text-center mt-1">¡Presupuesto excedido!</p>}
          </div>
      )}
      
      <div>
        <h5 className="font-semibold text-slate-300 mb-2 border-t border-slate-700 pt-3">Efectos y Desventajas</h5>
        {technique.effects.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">Ningún efecto añadido.</p>
        ) : (
          <ul className="space-y-2">
            {technique.effects.map((instance) => (
              <li key={instance.id} className="bg-slate-900/50 p-2 rounded-md group">
                <div className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <span className="font-medium text-slate-200">{instance.effect.name}</span>
                      {instance.isSecondary && <span className="text-xs text-orange-400/80 ml-1">(Secundario)</span>}
                       {instance.selectedOptions.length > 0 && (
                        <div className="text-xs text-slate-400 mt-1 flex flex-col items-start gap-1">
                            {(() => {
                                if (instance.effect.id === 'pen_estado_alterado') {
                                    const mainState = instance.selectedOptions.find(opt => opt.optionId === 'estado_select');
                                    const extraStates = instance.selectedOptions.filter(opt => opt.optionId.startsWith('extra_estado_'));
                                    const otherOptions = instance.selectedOptions.filter(opt => opt.optionId !== 'estado_select' && !opt.optionId.startsWith('extra_estado_'));
                                    
                                    const stateElements: React.ReactNode[] = [];
                                    if (mainState?.value) {
                                         stateElements.push(<span key="main_state" className="bg-slate-700 px-1.5 py-0.5 rounded">{mainState.value}</span>);
                                    }
                                    if (extraStates.length > 0) {
                                        const extraStatesText = extraStates.map(s => s.value).join(', ');
                                        stateElements.push(<span key="extra_states" className="bg-slate-700 px-1.5 py-0.5 rounded">{extraStatesText} (ND -2)</span>);
                                    }

                                    return (
                                        <>
                                            <div className="flex flex-wrap gap-1">
                                                {otherOptions.map(opt => (
                                                    <span key={opt.optionId} className="bg-slate-700 px-1.5 py-0.5 rounded">{opt.value === 'true' ? opt.name : opt.value}</span>
                                                ))}
                                            </div>
                                            {stateElements.length > 0 && <div className="flex flex-wrap gap-1">{stateElements}</div>}
                                        </>
                                    );
                                }
                                // Default rendering for other effects
                                return (
                                    <div className="flex flex-wrap gap-1">
                                        {instance.selectedOptions.map(opt => (
                                            <span key={opt.optionId} className="bg-slate-700 px-1.5 py-0.5 rounded">{opt.value === 'true' ? opt.name : opt.value}</span>
                                        ))}
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${instance.finalCost >= 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                        {instance.finalCost > 0 ? `+${instance.finalCost}` : instance.finalCost} PC
                        </span>
                        <button onClick={() => removeEffect(instance.id)} className="text-slate-500 hover:text-rose-500 transition-opacity">
                            <RemoveIcon />
                        </button>
                    </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
});

export default TechniqueCard;