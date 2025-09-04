export type DragMatchActivity = {
  id: string;                       // uuid o slug
  type: 'game';
  template: 'drag-match';
  title: string;
  instructions?: string;
  items: Array<{
    id: string;                     // único (para DnD)
    key: string;                    // clave de emparejamiento
    label?: string;                 // texto (opcional)
    image?: string;                 // URL a imagen (opcional)
    audio?: string;                 // URL audio (opcional)
  }>;
  targets: Array<{
    id: string;                     // único
    key: string;                    // debe coincidir con 'key' de su item
    label?: string;
    image?: string;
    audio?: string;
  }>;
  layout?: {
    itemsPerRow?: number;
    targetsPerRow?: number;
  };
  rules?: {
    maxAttempts?: number;           // global
    shuffle?: boolean;              // por defecto true
    allowPartialCheck?: boolean;    // si muestra OK por pareja al acertar
  };
  feedback?: {
    correct?: string[];
    incorrect?: string[];
    pairCorrect?: string[];         // cuando unes una pareja concreta
  };
  hints?: string[];                 // máx. 3 recomendado
};

export interface DragMatchProgress {
  activityId: string;
  attempts: number;
  hintsUsed: number;
  success: boolean;
  elapsedMs: number;
  timestamp: number;
  pairsCompleted: number;
  totalPairs: number;
}