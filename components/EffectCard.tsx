import React, { useState, useMemo, useEffect } from 'react';
import type { Effect, EffectOption, SelectedEffectOption, PowerLevel } from '../types';

interface EffectCardProps {
    effect: Effect;
    onAdd: (effect: Effect, selectedOptions: SelectedEffectOption[]) => void;
    canAdd: () => boolean;
    techniqueLevel: PowerLevel | null;
}

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
);

export const EffectCard: React.FC<EffectCardProps> = ({ effect, onAdd, canAdd, techniqueLevel }) => {
    const [selectedOptions, setSelectedOptions] = useState<SelectedEffectOption[]>([]);
    
    // Filtramos las opciones basadas en el nivel de la técnica (Regla P.A.P.A)
    const filteredOptions = useMemo(() => {
        if (!effect.options) return [];
        return effect.options.map(opt => {
            if (opt.type === 'select' && opt.values) {
                return {
                    ...opt,
                    values: opt.values.filter(val => {
                        // El multiplicador x4 es solo Nivel 3
                        if (val.name.includes("x4") && techniqueLevel !== 'Nivel 3') return false;
                        return true;
                    })
                };
            }
            return opt;
        });
    }, [effect.options, techniqueLevel]);

    useEffect(() => {
        const initialSelections: SelectedEffectOption[] = [];
        if (filteredOptions) {
            for (const option of filteredOptions) {
                if (option.type === 'select' && option.values && option.values.length > 0) {
                    const firstValue = option.values[0];
                    initialSelections.push({
                        optionId: option.id,
                        name: option.name,
                        value: firstValue.name,
                        cost: firstValue.cost
                    });
                }
            }
        }
        setSelectedOptions(initialSelections);
    }, [filteredOptions]);

    const handleOptionChange = (option: EffectOption, value: string, optionIdOverride?: string) => {
        const optionId = optionIdOverride || option.id;

        setSelectedOptions(prev => {
            const existing = prev.find(o => o.optionId === optionId);

            if (option.type === 'select') {
                const selectedValue = option.values?.find(v => v.name === value);
                 if (!selectedValue) return prev;

                const newOption: SelectedEffectOption = { optionId, name: option.name, value: selectedValue.name, cost: selectedValue.cost };
                if (existing) {
                    return prev.map(o => (o.optionId === optionId ? newOption : o));
                } else {
                    return [...prev, newOption];
                }
            }

            if (option.type === 'boolean') {
                const isChecked = value === 'true';
                if (isChecked) {
                    const newOption: SelectedEffectOption = { optionId: option.id, name: option.name, value: 'true', cost: option.cost || 0 };
                    return existing ? prev : [...prev, newOption];
                } else {
                    return prev.filter(o => o.optionId !== option.id);
                }
            }
            return prev;
        });
    };

    const { totalCost } = useMemo(() => {
        const optionsCost = selectedOptions.reduce((sum, opt) => sum + opt.cost, 0);
        return { 
            totalCost: effect.baseCost + optionsCost 
        };
    }, [effect.baseCost, selectedOptions]);

    const isAddDisabled = !canAdd();
    const isDisadvantage = effect.category === "Desventajas";

    return (
        <div className={`flex flex-col justify-between p-4 rounded-lg border transition-all duration-200 ${isDisadvantage ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-slate-900/50 border-slate-700'}`}>
            <div>
                <h4 className={`font-bold ${isDisadvantage ? 'text-emerald-400' : 'text-slate-200'}`}>{effect.name}</h4>
                <p className="text-xs text-slate-400 mt-1">{effect.description}</p>
            </div>

            {filteredOptions && filteredOptions.length > 0 && (
                 <div className="space-y-2 mt-3">
                    {filteredOptions.map(option => (
                        <div key={option.id}>
                            <label className="text-xs font-semibold text-slate-400 block mb-1">{option.name}</label>
                            {option.description && <p className="text-xs text-slate-500 mb-1 italic">{option.description}</p>}
                            {option.type === 'select' && option.values && (
                                <select 
                                    onChange={(e) => handleOptionChange(option, e.target.value)}
                                    value={selectedOptions.find(o => o.optionId === option.id)?.value || ''}
                                    className="w-full text-xs bg-slate-800 border border-slate-600 rounded-md py-1 px-2 text-slate-200 focus:ring-orange-500 focus:border-orange-500 transition"
                                >
                                    {option.values.map(v => <option key={v.name} value={v.name}>{v.name} ({v.cost >= 0 ? '+' : ''}{v.cost} PC)</option>)}
                                </select>
                            )}
                            {option.type === 'boolean' && (
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input type="checkbox" 
                                    checked={!!selectedOptions.find(o => o.optionId === option.id)}
                                    onChange={(e) => handleOptionChange(option, e.target.checked.toString())} className="form-checkbox bg-slate-700 border-slate-600 rounded text-orange-500 focus:ring-orange-500"/>
                                    <span className="text-xs text-slate-300">Activar</span>
                                </label>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-700/50">
                <span className={`text-sm font-bold ${isDisadvantage ? 'text-emerald-400' : 'text-orange-400'}`}>
                    {totalCost} PC
                </span>
                <button
                    onClick={() => onAdd(effect, selectedOptions)}
                    disabled={isAddDisabled}
                    className={`flex items-center gap-1 text-xs font-bold py-1 px-2 rounded-md transition-colors duration-200 ${
                        isDisadvantage 
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed' 
                        : 'bg-orange-500 hover:bg-orange-600 text-white disabled:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                >
                    <PlusIcon /> Añadir
                </button>
            </div>
        </div>
    );
};