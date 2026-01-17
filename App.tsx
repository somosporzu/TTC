import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { Technique, EffectInstance, PowerLevel, Force, Effect, SelectedEffectOption } from './types';
import { POWER_LEVELS, EFFECTS, FORCES, EFFECT_CATEGORIES } from './constants';
import TechniqueCreator from './components/TechniqueCreator';
import TechniqueCard from './components/TechniqueCard';
import { initialTechniqueState } from './constants';

declare const htmlToImage: any;

function App() {
  const [technique, setTechnique] = useState<Technique>(initialTechniqueState);
  const [copyButtonText, setCopyButtonText] = useState('Copiar como Texto');
  const [exportButtonText, setExportButtonText] = useState('Exportar como Imagen');
  const techniqueCardRef = useRef<HTMLDivElement>(null);

  const pcBudget = useMemo(() => {
    if (!technique.level) return 0;
    return POWER_LEVELS[technique.level].pcBudget;
  }, [technique.level]);

  const totalPcCost = useMemo(() => {
    // 1. Separamos costes positivos y beneficios negativos (desventajas)
    const positiveCosts = technique.effects
      .filter(e => e.finalCost >= 0)
      .reduce((sum, e) => sum + e.finalCost, 0);
    
    const negativeBenefits = technique.effects
      .filter(e => e.finalCost < 0)
      .reduce((sum, e) => sum + e.finalCost, 0);

    // 2. Aplicamos el LÍMITE de -12 PC por desventajas (Manual p. 27)
    // negativeBenefits es un número negativo, por eso usamos Math.max para el tope
    const effectiveNegativeBenefits = Math.max(negativeBenefits, -12);
    
    return positiveCosts + effectiveNegativeBenefits;
  }, [technique.effects]);
  
  const handleReset = () => {
    setTechnique(initialTechniqueState);
  };

  const handleSetLevel = (level: PowerLevel) => {
    const baseResistanceCost = POWER_LEVELS[level].resistanceCost;
    setTechnique(prev => ({ 
      ...prev, 
      level, 
      resistanceCost: baseResistanceCost 
    }));
  };

  const handleSetForce = (force: Force) => {
    setTechnique(prev => ({ ...prev, force }));
  };
  
  const handleAddEffect = (effect: Effect, selectedOptions: SelectedEffectOption[]) => {
    // Validamos reglas especiales
    const isMultiplier = effect.id === 'of_multiplicador';
    const hasDamageBonus = technique.effects.some(e => e.effect.id === 'of_bono_dano');
    
    if (isMultiplier && hasDamageBonus) {
        alert("Regla P.A.P.A: Un multiplicador de daño NO puede combinarse con Bonos al Daño.");
        return;
    }

    setTechnique(prev => {
      const optionsCost = selectedOptions.reduce((sum, opt) => sum + opt.cost, 0);
      const baseEffectCost = effect.baseCost + optionsCost;
      const isSecondary = prev.effects.length > 0;
      
      const newEffectInstance: EffectInstance = {
        id: `${effect.id}-${Date.now()}`,
        effect,
        finalCost: baseEffectCost,
        isSecondary,
        selectedOptions,
      };
      
      return { ...prev, effects: [...prev.effects, newEffectInstance] };
    });
  };
  
  const handleRemoveEffect = (instanceId: string) => {
    setTechnique(prev => {
        const newEffects = prev.effects.filter(e => e.id !== instanceId);
        const recalculatedEffects = newEffects.map((instance, index) => {
            const optionsCost = instance.selectedOptions.reduce((sum, opt) => sum + opt.cost, 0);
            return {...instance, isSecondary: index > 0, finalCost: instance.effect.baseCost + optionsCost};
        });
        return { ...prev, effects: recalculatedEffects };
    });
  };

  const handleCopy = () => {
    if (!technique.level) return;

    const effectLines = technique.effects.map(instance => {
      let optionsStr = '';
      if (instance.selectedOptions.length > 0) {
        const optionDetails = instance.selectedOptions
          .map(opt => (opt.value === 'true' ? opt.name.split(' (')[0] : opt.value))
          .filter(Boolean);
        if (optionDetails.length > 0) {
            optionsStr = ` (${optionDetails.join(', ')})`;
        }
      }
      return `- ${instance.effect.name}${optionsStr}: ${instance.finalCost >= 0 ? '+' : ''}${instance.finalCost} PC`;
    }).join('\n');

    const textToCopy = `
--- TÉCNICA: ${technique.name || 'Sin Nombre'} ---

Nivel: ${technique.level}
Fuerza: ${technique.force || 'Ninguna'}
Coste de Resistencia: ${technique.resistanceCost}

PC Gastados: ${totalPcCost} / ${pcBudget}

Descripción:
${technique.description || 'Sin descripción.'}

--- EFECTOS ---
${effectLines || 'Ningún efecto añadido.'}
    `.trim().replace(/^    /gm, '');

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopyButtonText('¡Copiado!');
      setTimeout(() => setCopyButtonText('Copiar como Texto'), 2000);
    });
  };

  const generateManualMD = () => {
    let md = `# Manual de Creación de Técnicas RPG - Sistema P.A.P.A\n\n`;
    md += `## 1. Niveles de Poder\n\n| Nivel | Resistencia | PC Disponibles |\n| :--- | :---: | :---: |\n`;
    Object.entries(POWER_LEVELS).forEach(([name, data]) => {
      md += `| ${name} | ${data.resistanceCost} | ${data.pcBudget} |\n`;
    });

    md += `\n## 2. Fuerzas Dominantes\n\n`;
    Object.entries(FORCES).forEach(([name, data]) => {
      md += `* **${name}:** ${data.description}\n`;
    });

    md += `\n## 3. Catálogo de Efectos\n\n`;
    EFFECT_CATEGORIES.forEach(cat => {
      md += `### ${cat}\n`;
      EFFECTS.filter(e => e.category === cat).forEach(e => {
        md += `#### ${e.name}\n${e.description}\n`;
        if (e.restrictions.length > 0) md += `* **Fuerzas Prohibidas:** ${e.restrictions.join(', ')}\n`;
        if (e.options) {
          md += `* **Opciones:**\n`;
          e.options.forEach(opt => {
            if (opt.type === 'select') {
              md += `  - ${opt.name}: ${opt.values?.map(v => `${v.name} (${v.cost} PC)`).join(', ')}\n`;
            } else {
              md += `  - ${opt.name} (${opt.cost} PC)\n`;
            }
          });
        }
        md += `\n`;
      });
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'manual_papa_rpg.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportImage = () => {
    if (!techniqueCardRef.current) return;
    setExportButtonText('Exportando...');
    htmlToImage.toPng(techniqueCardRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `${technique.name.replace(/\s+/g, '-').toLowerCase() || 'tecnica'}.png`;
        link.href = dataUrl;
        link.click();
        setExportButtonText('¡Exportado!');
        setTimeout(() => setExportButtonText('Exportar como Imagen'), 2000);
      });
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-orange-500 tracking-tight">
            Sistema P.A.P.A. - Creador de Técnicas
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
            Diseña y equilibra habilidades sobrenaturales siguiendo las reglas del manual oficial.
          </p>
          <button 
            onClick={generateManualMD}
            className="mt-4 text-xs bg-slate-700/50 hover:bg-slate-700 text-slate-400 py-1 px-3 rounded-full border border-slate-600 transition"
          >
            📄 Descargar Manual P.A.P.A. (.md)
          </button>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TechniqueCreator 
              technique={technique}
              setTechnique={setTechnique}
              setLevel={handleSetLevel}
              setForce={handleSetForce}
              addEffect={handleAddEffect}
              pcBudget={pcBudget}
              totalPcCost={totalPcCost}
            />
          </div>
          <div className="lg:col-span-1">
             <div className="sticky top-8">
                <TechniqueCard 
                  ref={techniqueCardRef}
                  technique={technique} 
                  totalPcCost={totalPcCost}
                  pcBudget={pcBudget}
                  removeEffect={handleRemoveEffect}
                />
                 <div className="mt-4 flex flex-col gap-2">
                    <button
                        onClick={handleExportImage}
                        disabled={!technique.level || exportButtonText !== 'Exportar como Imagen'}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:bg-slate-700 disabled:opacity-50"
                    >
                        {exportButtonText}
                    </button>
                    <button
                        onClick={handleCopy}
                        disabled={!technique.level}
                        className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
                    >
                        {copyButtonText}
                    </button>
                    <button
                        onClick={handleReset}
                        className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                        Empezar de Nuevo
                    </button>
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;