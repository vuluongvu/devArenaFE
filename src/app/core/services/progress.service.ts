import { Injectable, inject, signal } from '@angular/core';
import { MockDataService } from './mock-data.service';
import { ProblemService } from './problem.service';
import { LearningPath, UserStats, TopicProgress } from '../models/progress.model';

@Injectable({
  providedIn: 'root'
})
export class ProgressService {
  private mockData = inject(MockDataService);
  private problemService = inject(ProblemService);

  readonly stats = signal<UserStats>(this.mockData.getUserStats());
  readonly learningPaths = signal<LearningPath[]>(this.mockData.learningPaths);
  readonly topicProgress = signal<TopicProgress[]>(this.mockData.getTopicProgress());

  recalculateStats(): void {
    const problems = this.problemService.problemsList();
    const solved = problems.filter(p => p.userStatus === 'SOLVED');
    const easySolved = solved.filter(p => p.difficulty === 'EASY').length;
    const mediumSolved = solved.filter(p => p.difficulty === 'MEDIUM').length;
    const hardSolved = solved.filter(p => p.difficulty === 'HARD').length;

    const totalEasy = problems.filter(p => p.difficulty === 'EASY').length;
    const totalMedium = problems.filter(p => p.difficulty === 'MEDIUM').length;
    const totalHard = problems.filter(p => p.difficulty === 'HARD').length;

    this.stats.set({
      totalSolved: solved.length,
      totalProblems: problems.length,
      solvedByDifficulty: {
        easy: easySolved,
        totalEasy,
        medium: mediumSolved,
        totalMedium,
        hard: hardSolved,
        totalHard
      },
      acceptanceRate: 78.5,
      currentStreakDays: 4,
      totalSubmissions: 14
    });
  }
}
