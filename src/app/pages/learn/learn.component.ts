import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProgressService } from '../../core/services/progress.service';
import { LearningPath } from '../../core/models/progress.model';

@Component({
  selector: 'app-learn',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, BadgeComponent],
  template: `
    <div class="learn-page">
      <!-- Page Header -->
      <header class="page-header">
        <h1 class="page-title">Structured Learning Paths</h1>
        <p class="page-subtitle">
          Methodical curricula designed to build problem-solving muscle memory, understand asymptotic bounds, and conquer technical interview patterns.
        </p>
      </header>

      <!-- Learning Paths List -->
      <div class="paths-container">
        <div *ngFor="let path of learningPaths()" class="path-card">
          <!-- Card Header -->
          <div class="path-header">
            <div class="path-meta-row">
              <span class="path-level-tag">{{ path.level }}</span>
              <app-badge [difficulty]="path.difficulty"></app-badge>
              <span class="path-duration">
                <app-icon name="clock" [size]="12"></app-icon>
                <span>~{{ path.estimatedHours }} hours</span>
              </span>
            </div>
            <h2 class="path-title">{{ path.title }}</h2>
            <p class="path-desc">{{ path.description }}</p>

            <!-- Overall Path Progress -->
            <div class="path-progress-box">
              <div class="progress-info">
                <span>Progress: <strong>{{ path.completedModules }}</strong> of {{ path.totalModules }} modules complete</span>
                <span class="percentage-val">{{ Math.round((path.completedModules / path.totalModules) * 100) }}%</span>
              </div>
              <div class="progress-bar-track">
                <div
                  class="progress-bar-fill"
                  [style.width.%]="(path.completedModules / path.totalModules) * 100"
                ></div>
              </div>
            </div>
          </div>

          <!-- Topics / Modules Accordion -->
          <div class="path-modules-list">
            <div *ngFor="let topic of path.topics; let modIdx = index" class="module-item">
              <div class="module-header">
                <div class="module-title-group">
                  <span class="module-index">0{{ modIdx + 1 }}</span>
                  <div>
                    <h3 class="module-name">{{ topic.name }}</h3>
                    <p class="module-desc">{{ topic.description }}</p>
                  </div>
                </div>
                <div class="module-stat">
                  <span>{{ topic.completedCount }} / {{ topic.problemsCount }} Solved</span>
                </div>
              </div>

              <!-- Module Problems Mini Table -->
              <div class="module-problems-list">
                <div *ngFor="let p of topic.problems" class="module-prob-row">
                  <div class="prob-left">
                    <app-icon
                      [name]="p.solved ? 'check-circle' : 'code'"
                      [size]="14"
                      [customClass]="p.solved ? 'text-easy' : 'text-muted'"
                    ></app-icon>
                    <a [routerLink]="['/problems', p.slug]" class="prob-link">
                      <span *ngIf="p.id" class="prob-id">{{ p.id }}. </span>
                      <span>{{ p.title }}</span>
                    </a>
                  </div>
                  <div class="prob-right">
                    <app-badge [difficulty]="p.difficulty"></app-badge>
                    <a [routerLink]="['/problems', p.slug]" class="solve-action-btn">
                      <span>{{ p.solved ? 'Review' : 'Practice' }}</span>
                      <app-icon name="chevron-right" [size]="12"></app-icon>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .learn-page {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .page-header {
      max-width: 650px;
    }
    .page-title {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--color-text-primary);
      margin-bottom: 8px;
    }
    .page-subtitle {
      font-size: 15px;
      line-height: 1.6;
      color: var(--color-text-secondary);
    }
    .paths-container {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .path-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }
    .path-header {
      padding: 28px 32px;
      border-bottom: 1px solid var(--color-border);
      background-color: var(--color-sidebar);
    }
    .path-meta-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .path-level-tag {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-secondary);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }
    .path-duration {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12.5px;
      color: var(--color-text-muted);
    }
    .path-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 8px;
    }
    .path-desc {
      font-size: 14.5px;
      color: var(--color-text-secondary);
      line-height: 1.6;
      max-width: 840px;
      margin-bottom: 20px;
    }
    .path-progress-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 520px;
    }
    .progress-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      color: var(--color-text-secondary);
    }
    .percentage-val {
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .progress-bar-track {
      height: 7px;
      background-color: var(--color-border);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .progress-bar-fill {
      height: 100%;
      background-color: var(--color-accent);
      border-radius: var(--radius-full);
      transition: width 0.3s ease;
    }

    /* Modules List */
    .path-modules-list {
      display: flex;
      flex-direction: column;
    }
    .module-item {
      border-bottom: 1px solid var(--color-border-subtle);
      padding: 24px 32px;
    }
    .module-item:last-child {
      border-bottom: none;
    }
    .module-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 18px;
      margin-bottom: 16px;
    }
    .module-title-group {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .module-index {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 700;
      color: var(--color-accent);
      padding-top: 1px;
    }
    .module-name {
      font-size: 15.5px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin-bottom: 4px;
    }
    .module-desc {
      font-size: 13.5px;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }
    .module-stat {
      font-size: 13px;
      font-weight: 500;
      color: var(--color-text-muted);
      white-space: nowrap;
    }
    .module-problems-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-left: 30px;
    }
    .module-prob-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background-color: var(--color-sidebar);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast);
    }
    .module-prob-row:hover {
      background-color: var(--color-surface-hover);
    }
    .prob-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .prob-link {
      font-size: 14.5px;
      font-weight: 500;
      color: var(--color-text-primary);
    }
    .prob-link:hover {
      color: var(--color-accent);
    }
    .prob-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .solve-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      font-weight: 500;
      color: var(--color-text-secondary);
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast);
    }
    .solve-action-btn:hover {
      color: var(--color-accent);
    }
  `]
})
export class LearnComponent implements OnInit {
  private progressService = inject(ProgressService);
  private route = inject(ActivatedRoute);

  learningPaths = this.progressService.learningPaths;
  Math = Math;

  ngOnInit(): void {
    // Check if queryParam requested a specific track
    this.route.queryParams.subscribe();
  }
}
