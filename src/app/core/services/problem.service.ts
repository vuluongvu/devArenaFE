import { Injectable, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { MockDataService } from './mock-data.service';
import { Problem, ProblemFilter, UserSolveStatus } from '../models/problem.model';

@Injectable({
  providedIn: 'root'
})
export class ProblemService {
  private api = inject(ApiService);
  private mockData = inject(MockDataService);

  readonly problemsList = signal<Problem[]>(this.mockData.problems);
  readonly categories = signal<string[]>(this.mockData.categories);

  getProblems(filter?: ProblemFilter): Observable<Problem[]> {
    return this.api.get<Problem[]>('/problems').pipe(
      map(apiProblems => {
        // If backend returned data, merge with rich client metadata if needed
        if (apiProblems && apiProblems.length > 0) {
          return this.applyFilter(apiProblems, filter);
        }
        return this.applyFilter(this.problemsList(), filter);
      }),
      catchError(() => {
        // Fallback to local high-fidelity problem collection
        return of(this.applyFilter(this.problemsList(), filter));
      })
    );
  }

  getProblemBySlug(slug: string): Observable<Problem | null> {
    return this.api.get<Problem>(`/problems/${slug}`).pipe(
      map(problem => {
        if (problem) {
          // Merge with sample test cases / starter codes if missing from simple backend response
          const localMatch = this.problemsList().find(p => p.slug === slug);
          if (localMatch) {
            return {
              ...localMatch,
              ...problem,
              sampleTestCases: problem.sampleTestCases || localMatch.sampleTestCases,
              starterCode: problem.starterCode || localMatch.starterCode
            };
          }
          return problem;
        }
        return this.findLocalProblem(slug);
      }),
      catchError(() => {
        return of(this.findLocalProblem(slug));
      })
    );
  }

  private findLocalProblem(slug: string): Problem | null {
    const found = this.problemsList().find(p => p.slug === slug);
    return found ? { ...found } : null;
  }

  updateSolveStatus(slug: string, status: UserSolveStatus): void {
    const updated = this.problemsList().map(p => {
      if (p.slug === slug) {
        return { ...p, userStatus: status };
      }
      return p;
    });
    this.problemsList.set(updated);
  }

  private applyFilter(problems: Problem[], filter?: ProblemFilter): Problem[] {
    if (!filter) return problems;

    let result = [...problems];

    if (filter.search && filter.search.trim() !== '') {
      const q = filter.search.toLowerCase().trim();
      const numQuery = parseInt(q.replace('#', ''), 10);
      result = result.filter(p =>
        (!isNaN(numQuery) && p.id === numQuery) ||
        p.id.toString() === q ||
        `#${p.id}` === q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filter.difficulty && filter.difficulty !== 'ALL') {
      result = result.filter(p => p.difficulty === filter.difficulty);
    }

    if (filter.category && filter.category !== 'ALL') {
      result = result.filter(p => p.category === filter.category);
    }

    if (filter.status && filter.status !== 'ALL') {
      result = result.filter(p => (p.userStatus || 'TODO') === filter.status);
    }

    if (filter.sortBy) {
      const order = filter.sortOrder === 'desc' ? -1 : 1;
      result.sort((a, b) => {
        if (filter.sortBy === 'id') {
          return (a.id - b.id) * order;
        }
        if (filter.sortBy === 'title') {
          return a.title.localeCompare(b.title) * order;
        }
        if (filter.sortBy === 'difficulty') {
          const rank = { EASY: 1, MEDIUM: 2, HARD: 3 };
          return (rank[a.difficulty] - rank[b.difficulty]) * order;
        }
        if (filter.sortBy === 'acceptance') {
          return (a.acceptanceRate - b.acceptanceRate) * order;
        }
        return 0;
      });
    }

    return result;
  }
}
