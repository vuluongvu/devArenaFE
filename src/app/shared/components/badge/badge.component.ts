import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Difficulty, UserSolveStatus } from '../../../core/models/problem.model';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <!-- Difficulty Badge -->
    <span
      *ngIf="difficulty"
      class="badge badge-difficulty"
      [ngClass]="'diff-' + difficulty.toLowerCase()"
    >
      {{ difficulty === 'EASY' ? 'Easy' : difficulty === 'MEDIUM' ? 'Med' : 'Hard' }}
    </span>

    <!-- Status Badge -->
    <span
      *ngIf="status"
      class="badge badge-status"
      [ngClass]="'status-' + status.toLowerCase()"
    >
      <app-icon
        *ngIf="status === 'SOLVED'"
        name="check"
        [size]="12"
        [strokeWidth]="2.5"
      ></app-icon>
      <app-icon
        *ngIf="status === 'ATTEMPTED'"
        name="clock"
        [size]="12"
        [strokeWidth]="2"
      ></app-icon>
      <span class="status-label">{{ status === 'SOLVED' ? 'Solved' : status === 'ATTEMPTED' ? 'Attempted' : 'Todo' }}</span>
    </span>

    <!-- Tag Badge -->
    <span
      *ngIf="tag"
      class="badge badge-tag"
    >
      {{ tag }}
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      line-height: 1.25;
      white-space: nowrap;
      transition: background-color var(--transition-fast), border-color var(--transition-fast);
    }

    /* Difficulty Variants */
    .diff-easy {
      color: var(--color-easy);
      background-color: var(--color-easy-bg);
      border: 1px solid var(--color-easy-border);
    }
    .diff-medium {
      color: var(--color-medium);
      background-color: var(--color-medium-bg);
      border: 1px solid var(--color-medium-border);
    }
    .diff-hard {
      color: var(--color-hard);
      background-color: var(--color-hard-bg);
      border: 1px solid var(--color-hard-border);
    }

    /* Status Variants */
    .status-solved {
      color: var(--color-easy);
      background-color: var(--color-easy-bg);
      border: 1px solid var(--color-easy-border);
    }
    .status-attempted {
      color: var(--color-medium);
      background-color: var(--color-medium-bg);
      border: 1px solid var(--color-medium-border);
    }
    .status-todo {
      color: var(--color-text-muted);
      background-color: var(--color-surface-hover);
      border: 1px solid var(--color-border);
    }

    /* Tag Variant */
    .badge-tag {
      color: var(--color-text-secondary);
      background-color: var(--color-surface-hover);
      border: 1px solid var(--color-border-subtle);
      font-size: 11px;
    }
    .badge-tag:hover {
      border-color: var(--color-border);
      color: var(--color-text-primary);
    }
  `]
})
export class BadgeComponent {
  @Input() difficulty?: Difficulty | string;
  @Input() status?: UserSolveStatus | string;
  @Input() tag?: string;
}
