export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type ProblemStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type UserSolveStatus = 'SOLVED' | 'ATTEMPTED' | 'TODO';

export type SupportedLanguage = 'TypeScript' | 'JavaScript' | 'Python' | 'Java' | 'C++' | 'C';

export interface ProblemTestCase {
  id: number;
  input: string;
  expectedOutput: string;
  explanation?: string;
  isSample: boolean;
  orderIndex?: number;
}

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  statement: string;
  category: string;
  timeLimitMs: number;
  memoryLimitMb: number;
  problemStatus?: ProblemStatus;
  acceptanceRate: number;
  userStatus?: UserSolveStatus;
  tags: string[];
  sampleTestCases: ProblemTestCase[];
  allTestCases?: ProblemTestCase[];
  starterCode: Partial<Record<SupportedLanguage, string>> & Record<string, string>;
  solutionEditorial?: {
    summary: string;
    approach: string;
    timeComplexity: string;
    spaceComplexity: string;
    code: Partial<Record<SupportedLanguage, string>> & Record<string, string>;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface ProblemFilter {
  search?: string;
  difficulty?: Difficulty | 'ALL';
  category?: string | 'ALL';
  status?: UserSolveStatus | 'ALL';
  sortBy?: 'id' | 'title' | 'difficulty' | 'acceptance';
  sortOrder?: 'asc' | 'desc';
}
