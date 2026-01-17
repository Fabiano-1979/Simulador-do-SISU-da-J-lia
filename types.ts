export interface EnemScores {
  humanas: number;
  natureza: number;
  linguagens: number;
  matematica: number;
  redacao: number;
}

export enum ChanceLevel {
  MUITO_ALTA = "Muito Alta",
  ALTA = "Alta",
  MEDIA = "Média",
  BAIXA = "Baixa"
}

export interface CourseRecommendation {
  university: string;
  course: string;
  location: string;
  cutoffEstimate: number;
  chance: ChanceLevel;
  shift: string; // Matutino, Noturno, Integral
}
