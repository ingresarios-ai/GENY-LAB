// Legacy types (kept for backward compat during rewrite)
export type Category = 'Mentalidad' | 'Gestión' | 'Disciplina' | 'Visión' | 'Entorno';
export interface Question { id: string; category: Category; text: string; options: { text: string; points: number; }[]; }
export interface Level { min: number; max: number; title: string; description: string; color: string; }
export interface UserData { scores: Record<Category, number>; totalScore: number; level: Level; completedAt: string; }
export interface ChallengeDay { day: number; title: string; description: string; task: string; completed: boolean; }

// New AI diagnosis types
export interface TermostatoDiagnosis {
  puntaje_global: number;
  temperatura_label: string;
  categorias: { programacion: number; setpoint: number; neuronas_espejo: number; adaptacion: number; merecimiento: number; disciplina: number; };
  arquetipo: string;
  arquetipo_desc: string;
  tags_patron: string[];
  fortalezas: string[];
  sombras: string[];
  diagnostico_breve: string;
  primer_paso: string;
}
export interface TempLevel { max: number; label: string; color: string; range: string; }
