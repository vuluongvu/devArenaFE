import { Difficulty } from './problem.model';

export interface UserStats {
  totalSolved: number;
  totalProblems: number;
  solvedByDifficulty: {
    easy: number;
    totalEasy: number;
    medium: number;
    totalMedium: number;
    hard: number;
    totalHard: number;
  };
  acceptanceRate: number;
  currentStreakDays: number;
  totalSubmissions: number;
}

export interface TopicProgress {
  category: string;
  solved: number;
  total: number;
  percentage: number;
}

export interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  difficulty: Difficulty;
  totalModules: number;
  completedModules: number;
  estimatedHours: number;
  topics: {
    name: string;
    description: string;
    problemsCount: number;
    completedCount: number;
    problems: {
      slug: string;
      title: string;
      difficulty: Difficulty;
      solved: boolean;
    }[];
  }[];
}
