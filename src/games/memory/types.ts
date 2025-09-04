export type MemoryCardFace = {
  label?: string;        // texto: "triangle", "photosynthesis", "7"
  image?: string;        // opcional, URL a imagen (png/jpg/svg)
  audio?: string;        // opcional, URL audio (pronunciación)
};

export type MemoryActivity = {
  id: string;                         // uuid o slug
  type: 'game';
  template: 'memory';
  title: string;
  instructions?: string;
  cards: Array<{
    id: string;                       // único
    key: string;                      // empareja 2 (o más) cartas por la misma key
    face: MemoryCardFace;             // contenido mostrado al voltear
  }>;

  rules?: {
    shuffle?: boolean;                // default true
    previewMs?: number;               // ej. 1500; 0 = sin preview
    timeLimitSeconds?: number;        // ej. 90; 0 = sin límite
    grid?: { cols: number; rows: number }; // si no se pasa, se calcula
    scoring?: {
      threeStarsAttempts?: number;    // <= intentos para 3⭐
      twoStarsAttempts?: number;      // <= intentos para 2⭐
    };
  };

  feedback?: {
    correct?: string[];               // al completar una pareja
    incorrect?: string[];             // al fallar una pareja
    complete?: string[];              // al terminar el juego
  };

  hints?: string[];                   // mensajes genéricos que se muestran al usar pista
};

export interface MemoryGameProgress {
  activityId: string;
  attempts: number;
  matches: number;
  mistakes: number;
  hintsUsed: number;
  success: boolean;
  elapsedMs: number;
  starRating: number;
  timestamp: number;
}

export interface MemoryCard {
  id: string;
  key: string;
  face: MemoryCardFace;
  isFlipped: boolean;
  isMatched: boolean;
  isSelected: boolean;
}