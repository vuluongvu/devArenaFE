import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProblemService } from '../../core/services/problem.service';
import { ProgressService } from '../../core/services/progress.service';
import { Problem, Difficulty, UserSolveStatus, ProblemFilter } from '../../core/models/problem.model';

@Component({
  selector: 'app-problems',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, BadgeComponent],
  templateUrl: './problems.component.html',
  styleUrls: ['./problems.component.css']
})
export class ProblemsComponent implements OnInit {
  private problemService = inject(ProblemService);
  private progressService = inject(ProgressService);
  private route = inject(ActivatedRoute);

  stats = this.progressService.stats;
  categories = this.problemService.categories;

  problems: Problem[] = [];
  isLoading = false;
  errorMessage = '';

  // Filter & Search controls
  searchQuery = '';
  selectedDifficulty: Difficulty | 'ALL' = 'ALL';
  selectedCategory: string | 'ALL' = 'ALL';
  selectedStatus: UserSolveStatus | 'ALL' = 'ALL';
  sortBy: 'id' | 'title' | 'difficulty' | 'acceptance' = 'id';
  sortOrder: 'asc' | 'desc' = 'asc';

  viewMode: 'table' | 'grouped' = 'table';

  ngOnInit(): void {
    // Listen to query parameters from sidebar navigation (e.g. ?category=Arrays%20%26%20Hashing or ?status=SOLVED)
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      if (params['status']) {
        this.selectedStatus = params['status'];
      }
      if (params['search']) {
        this.searchQuery = params['search'];
      }
      this.fetchProblems();
    });
  }

  fetchProblems(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const filter: ProblemFilter = {
      search: this.searchQuery,
      difficulty: this.selectedDifficulty,
      category: this.selectedCategory,
      status: this.selectedStatus,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.problemService.getProblems(filter).subscribe({
      next: (data) => {
        this.problems = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to connect to the backend server. Showing offline practice problems.';
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.fetchProblems();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedDifficulty = 'ALL';
    this.selectedCategory = 'ALL';
    this.selectedStatus = 'ALL';
    this.sortBy = 'id';
    this.sortOrder = 'asc';
    this.fetchProblems();
  }

  toggleSort(field: 'id' | 'title' | 'difficulty' | 'acceptance'): void {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.fetchProblems();
  }

  // Group problems by category for the grouped view
  getGroupedProblems(): { category: string; problems: Problem[]; solvedCount: number }[] {
    const map = new Map<string, Problem[]>();
    for (const prob of this.problems) {
      if (!map.has(prob.category)) {
        map.set(prob.category, []);
      }
      map.get(prob.category)!.push(prob);
    }

    const groups: { category: string; problems: Problem[]; solvedCount: number }[] = [];
    map.forEach((probs, category) => {
      const solved = probs.filter(p => p.userStatus === 'SOLVED').length;
      groups.push({ category, problems: probs, solvedCount: solved });
    });

    return groups;
  }
}
