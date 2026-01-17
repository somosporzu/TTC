export enum PowerLevel {
  SUPPORT = 'Apoyo',
  LEVEL_1 = 'Nivel 1',
  LEVEL_2 = 'Nivel 2',
  LEVEL_3 = 'Nivel 3',
}

export enum Force {
  DESTRUCTION = 'Destrucción',
  CONSERVATION = 'Conservación',
  TRANSFORMATION = 'Transformación',
  CREATION = 'Creación',
  ORDER = 'Orden',
  CHAOS = 'Caos',
}

export interface EffectOptionValue {
    name: string;
    cost: number;
}

export interface EffectOption {
    id: string;
    name: string;
    description?: string;
    type: 'select' | 'boolean';
    cost?: number; // for boolean type
    values?: EffectOptionValue[]; // for select type
}

export interface Effect {
  id: string;
  category: string;
  name: string;
  description: string;
  baseCost: number;
  restrictions: Force[];
  options?: EffectOption[];
}

export interface SelectedEffectOption {
    optionId: string;
    name: string;
    value: string;
    cost: number;
}

export interface EffectInstance {
    id: string;
    effect: Effect;
    finalCost: number;
    isSecondary: boolean;
    selectedOptions: SelectedEffectOption[];
}

export interface Technique {
  // FIX: Add optional id and parentId for tree view functionality.
  id?: string;
  parentId?: string;
  name: string;
  description: string;
  level: PowerLevel | null;
  force: Force | null;
  effects: EffectInstance[];
  resistanceCost: number;
}