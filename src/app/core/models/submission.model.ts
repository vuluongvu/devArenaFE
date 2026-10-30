import { Difficulty, SupportedLanguage } from './problem.model';

export type SubmissionStatus =
  | 'ACCEPTED'
  | 'WRONG ANSWER'
  | 'TIME LIMIT EXCEEDED'
  | 'MEMORY LIMIT EXCEEDED'
  | 'RUNTIME ERROR'
  | 'COMPILATION ERROR'
  | 'COMPILATION_ERROR'
  | 'INTERNAL ERROR'
  | 'PENDING'
  | 'RUNNING';

export interface RunCodeDto {
  language: SupportedLanguage;
  sourceCode: string;
  input: string;
}

export interface SubmitCodeDto {
  problemId: number;
  language: SupportedLanguage;
  sourceCode: string;
}

export interface RunCodeResult {
  status: SubmissionStatus;
  stdout?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
  message?: string | null;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  expectedOutput?: string;
  actualOutput?: string;
  passed?: boolean;
}

export interface SubmissionEvaluationResult {
  status: SubmissionStatus;
  passedTestCases: number;
  totalTestCases: number;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  compileOutput?: string | null;
  message?: string | null;
}

export interface SubmissionHistoryItem {
  id: number;
  problemId: number;
  problemSlug: string;
  problemTitle: string;
  difficulty?: Difficulty;
  language: SupportedLanguage;
  status: SubmissionStatus;
  passedTestCases: number;
  totalTestCases: number;
  executionTimeMs: number;
  memoryUsedKb: number;
  submittedAt: string;
  sourceCode?: string;
}
