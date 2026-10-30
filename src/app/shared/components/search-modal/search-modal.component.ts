import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IconComponent } from '../icon/icon.component';
import { BadgeComponent } from '../badge/badge.component';
import { ProblemService } from '../../../core/services/problem.service';
import { Problem } from '../../../core/models/problem.model';

@Component({
  selector: 'app-search-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, BadgeComponent],
  template: `
    <div *ngIf="isOpen" class="modal-backdrop" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <!-- Search Input Bar -->
        <div class="search-input-header">
          <app-icon name="search" [size]="18" customClass="text-secondary"></app-icon>
          <input
            #searchInput
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onQueryChange()"
            placeholder="Search problems, algorithms, topics... (e.g. 'Two Sum', 'Dynamic Programming')"
            class="search-input"
            autofocus
          />
          <button class="kbd-badge" (click)="close()" title="Close (Esc)">
            ESC
          </button>
        </div>

        <!-- Search Results List -->
        <div class="search-results-container">
          <div *ngIf="filteredProblems.length === 0" class="empty-state">
            <app-icon name="search" [size]="24" customClass="text-muted"></app-icon>
            <p>No problems found matching "{{ searchQuery }}"</p>
            <span>Try searching for "Two Sum", "Anagram", "Stack", or "Tree"</span>
          </div>

          <div *ngIf="filteredProblems.length > 0" class="results-list">
            <div class="section-label">PROBLEMS ({{ filteredProblems.length }})</div>
            <div
              *ngFor="let prob of filteredProblems; let i = index"
              class="result-item"
              [class.active]="i === selectedIndex"
              (click)="selectProblem(prob)"
              (mouseenter)="selectedIndex = i"
            >
              <div class="item-left">
                <app-icon
                  [name]="prob.userStatus === 'SOLVED' ? 'check-circle' : 'code'"
                  [size]="15"
                  [customClass]="prob.userStatus === 'SOLVED' ? 'text-easy' : 'text-muted'"
                ></app-icon>
                <span class="problem-title">{{ prob.title }}</span>
                <span class="problem-category">{{ prob.category }}</span>
              </div>
              <div class="item-right">
                <app-badge [difficulty]="prob.difficulty"></app-badge>
                <app-icon name="chevron-right" [size]="14" customClass="text-muted"></app-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Shortcuts -->
        <div class="modal-footer">
          <div class="shortcut-tip">
            <kbd>↑</kbd><kbd>↓</kbd> to navigate
          </div>
          <div class="shortcut-tip">
            <kbd>↵</kbd> to select
          </div>
          <div class="shortcut-tip">
            <kbd>esc</kbd> to close
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(2px);
      z-index: 1000;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 12vh;
    }
    .modal-card {
      width: 100%;
      max-width: 680px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-modal);
      overflow: hidden;
      animation: modalFadeIn 0.18s ease-out;
    }
    @keyframes modalFadeIn {
      from { opacity: 0; transform: translateY(-8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .search-input-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 16px 22px;
      border-bottom: 1px solid var(--color-border);
    }
    .search-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 16px;
      color: var(--color-text-primary);
      outline: none;
    }
    .search-input::placeholder {
      color: var(--color-text-muted);
    }
    .kbd-badge {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-muted);
      background: var(--color-surface-hover);
      border: 1px solid var(--color-border);
      padding: 3px 6px;
      border-radius: var(--radius-xs);
    }
    .search-results-container {
      max-height: 420px;
      overflow-y: auto;
      padding: 10px;
    }
    .section-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--color-text-muted);
      letter-spacing: 0.06em;
      padding: 10px 12px 6px 12px;
    }
    .result-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }
    .result-item:hover, .result-item.active {
      background-color: var(--color-surface-hover);
    }
    .item-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .problem-title {
      font-size: 14.5px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
    .problem-category {
      font-size: 12.5px;
      color: var(--color-text-muted);
    }
    .item-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .empty-state {
      padding: 40px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--color-text-secondary);
    }
    .empty-state p {
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
    .empty-state span {
      font-size: 12px;
      color: var(--color-text-muted);
    }
    .modal-footer {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 10px 16px;
      border-top: 1px solid var(--color-border);
      background-color: var(--color-sidebar);
      font-size: 11px;
      color: var(--color-text-muted);
    }
    .shortcut-tip {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    kbd {
      font-family: inherit;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      padding: 1px 4px;
      font-size: 10px;
    }
  `]
})
export class SearchModalComponent {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  private problemService = inject(ProblemService);
  private router = inject(Router);

  searchQuery = '';
  filteredProblems: Problem[] = [];
  selectedIndex = 0;

  ngOnInit(): void {
    this.filteredProblems = this.problemService.problemsList().slice(0, 7);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isOpen) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        this.open();
      }
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex + 1) % (this.filteredProblems.length || 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex = (this.selectedIndex - 1 + this.filteredProblems.length) % (this.filteredProblems.length || 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (this.filteredProblems[this.selectedIndex]) {
        this.selectProblem(this.filteredProblems[this.selectedIndex]);
      }
    }
  }

  open(): void {
    this.isOpen = true;
    this.searchQuery = '';
    this.filteredProblems = this.problemService.problemsList().slice(0, 7);
    this.selectedIndex = 0;
  }

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  onQueryChange(): void {
    const q = this.searchQuery.toLowerCase().trim();
    const all = this.problemService.problemsList();
    if (!q) {
      this.filteredProblems = all.slice(0, 7);
    } else {
      this.filteredProblems = all.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      ).slice(0, 8);
    }
    this.selectedIndex = 0;
  }

  selectProblem(problem: Problem): void {
    this.close();
    this.router.navigate(['/problems', problem.slug]);
  }
}
