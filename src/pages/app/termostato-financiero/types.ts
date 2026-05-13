export type Category = 'Mentalidad' | 'Gestión' | 'Disciplina' | 'Visión' | 'Entorno';

export interface Question {
  id: string;
  category: Category;
  text: string;
  options: {
    text: string;
    points: number;
  }[];
}

export interface Level {
  min: number;
  max: number;
  title: string;
  description: string;
  color: string;
}

export interface UserData {
  scores: Record<Category, number>;
  totalScore: number;
  level: Level;
  completedAt: string;
}

export interface ChallengeDay {
  day: number;
  title: string;
  description: string;
  task: string;
  completed: boolean;
}
