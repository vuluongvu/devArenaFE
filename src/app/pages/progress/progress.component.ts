import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProgressService } from '../../core/services/progress.service';
import { SubmissionService } from '../../core/services/submission.service';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="progress-page">
      <!-- Header -->
      <header class="page-header">
        <h1 class="page-title">Personal Practice & Metrics</h1>
        <p class="page-subtitle">
          Track problem-solving velocity, topic coverage, and submission evaluations across algorithm categories.
        </p>
      </header>

      <!-- Top Summary Metrics Grid -->
      <div class="metrics-grid" *ngIf="stats() as s">
        <!-- Main Solved Card -->
        <div class="metric-card main-solved-card">
          <div class="metric-card-header">
            <span class="card-title">PROBLEMS SOLVED</span>
            <app-icon name="award" [size]="16" customClass="text-accent"></app-icon>
          </div>
          <div class="solved-counter">
            <span class="big-number">{{ s.totalSolved }}</span>
            <span class="total-denom">/ {{ s.totalProblems }}</span>
          </div>
          <div class="completion-bar">
            <div class="bar-fill" [style.width.%]="(s.totalSolved / s.totalProblems) * 100"></div>
          </div>
          <span class="card-caption">{{ ((s.totalSolved / s.totalProblems) * 100).toFixed(0) }}% total archive completed</span>
        </div>

        <!-- Easy Progress Card -->
        <div class="metric-card diff-card easy-card">
          <div class="metric-card-header">
            <span class="card-title text-easy">EASY</span>
            <span class="diff-fraction">{{ s.solvedByDifficulty.easy }} / {{ s.solvedByDifficulty.totalEasy }}</span>
          </div>
          <div class="completion-bar">
            <div class="bar-fill fill-easy" [style.width.%]="(s.solvedByDifficulty.easy / s.solvedByDifficulty.totalEasy) * 100"></div>
          </div>
          <span class="card-caption">Foundational patterns mastered</span>
        </div>

        <!-- Medium Progress Card -->
        <div class="metric-card diff-card medium-card">
          <div class="metric-card-header">
            <span class="card-title text-medium">MEDIUM</span>
            <span class="diff-fraction">{{ s.solvedByDifficulty.medium }} / {{ s.solvedByDifficulty.totalMedium }}</span>
          </div>
          <div class="completion-bar">
            <div class="bar-fill fill-medium" [style.width.%]="(s.solvedByDifficulty.medium / s.solvedByDifficulty.totalMedium) * 100"></div>
          </div>
          <span class="card-caption">Standard interview benchmarks</span>
        </div>

        <!-- Hard Progress Card -->
        <div class="metric-card diff-card hard-card">
          <div class="metric-card-header">
            <span class="card-title text-hard">HARD</span>
            <span class="diff-fraction">{{ s.solvedByDifficulty.hard }} / {{ s.solvedByDifficulty.totalHard }}</span>
          </div>
          <div class="completion-bar">
            <div class="bar-fill fill-hard" [style.width.%]="(s.solvedByDifficulty.hard / s.solvedByDifficulty.totalHard) * 100"></div>
          </div>
          <span class="card-caption">Advanced algorithmic edge-cases</span>
        </div>
      </div>

      <!-- Two-Column Layout: Topic Mastery & Recent Submissions -->
      <div class="content-split-grid">
        <!-- Topic Mastery Matrix -->
        <section class="topic-mastery-section">
          <div class="section-box-header">
            <div class="title-with-icon">
              <app-icon name="layers" [size]="16"></app-icon>
              <h2 class="section-heading">Topic Mastery Matrix</h2>
            </div>
            <span class="section-subtext">Coverage across domains</span>
          </div>

          <div class="topics-matrix-list">
            <div *ngFor="let t of topicProgress()" class="topic-row">
              <div class="topic-info">
                <span class="topic-name">{{ t.category }}</span>
                <span class="topic-counts"><strong>{{ t.solved }}</strong> / {{ t.total }}</span>
              </div>
              <div class="topic-bar-track">
                <div class="topic-bar-fill" [style.width.%]="t.percentage"></div>
              </div>
            </div>
          </div>
        </section>

        <!-- Submissions Log -->
        <section class="activity-log-section">
          <div class="section-box-header">
            <div class="title-with-icon">
              <app-icon name="clock" [size]="16"></app-icon>
              <h2 class="section-heading">Recent Evaluations</h2>
            </div>
            <span class="section-subtext">Automated Judge0 history</span>
          </div>

          <div class="submissions-scroll-wrap">
            <table class="activity-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Problem</th>
                  <th>Runtime</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let sub of submissionService.history()">
                  <td>
                    <span
                      class="sub-verdict-pill"
                      [class.verdict-pass]="sub.status === 'ACCEPTED'"
                      [class.verdict-fail]="sub.status !== 'ACCEPTED'"
                    >
                      {{ sub.status }}
                    </span>
                  </td>
                  <td>
                    <a [routerLink]="['/problems', sub.problemSlug]" class="sub-prob-link">
                      {{ sub.problemTitle }}
                    </a>
                  </td>
                  <td>{{ sub.executionTimeMs }} ms</td>
                  <td class="text-muted">{{ sub.submittedAt }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .progress-page {
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

    /* Top Metrics Cards */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }
    .metric-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: var(--shadow-sm);
    }
    .metric-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .card-title {
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
    }
    .diff-fraction {
      font-size: 13px;
      font-weight: 600;
      color: var(--color-text-secondary);
    }
    .solved-counter {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .big-number {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: var(--color-text-primary);
      line-height: 1;
    }
    .total-denom {
      font-size: 16px;
      color: var(--color-text-muted);
    }
    .completion-bar {
      height: 7px;
      background-color: var(--color-bg);
      border-radius: var(--radius-full);
      overflow: hidden;
      border: 1px solid var(--color-border);
    }
    .bar-fill {
      height: 100%;
      background-color: var(--color-accent);
      border-radius: var(--radius-full);
      transition: width 0.3s ease;
    }
    .fill-easy { background-color: var(--color-easy); }
    .fill-medium { background-color: var(--color-medium); }
    .fill-hard { background-color: var(--color-hard); }
    .card-caption {
      font-size: 12.5px;
      color: var(--color-text-muted);
    }

    /* Content Split Grid */
    .content-split-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }
    .topic-mastery-section, .activity-log-section {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .section-box-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      background-color: var(--color-sidebar);
      border-bottom: 1px solid var(--color-border);
    }
    .title-with-icon {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .section-heading {
      font-size: 15px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .section-subtext {
      font-size: 12.5px;
      color: var(--color-text-muted);
    }

    /* Topic Matrix */
    .topics-matrix-list {
      padding: 20px 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .topic-row {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .topic-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13.5px;
    }
    .topic-name {
      font-weight: 500;
      color: var(--color-text-primary);
    }
    .topic-counts {
      font-size: 12.5px;
      color: var(--color-text-secondary);
    }
    .topic-bar-track {
      height: 6px;
      background-color: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .topic-bar-fill {
      height: 100%;
      background-color: var(--color-accent);
      border-radius: var(--radius-full);
      transition: width 0.3s ease;
    }

    /* Activity Table */
    .submissions-scroll-wrap {
      overflow-x: auto;
    }
    .activity-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }
    .activity-table th {
      padding: 12px 16px;
      background-color: var(--color-sidebar);
      font-size: 11.5px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-text-muted);
      border-bottom: 1px solid var(--color-border);
      text-align: left;
    }
    .activity-table td {
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border-subtle);
      vertical-align: middle;
    }
    .sub-verdict-pill {
      font-size: 11px;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: var(--radius-xs);
    }
    .verdict-pass {
      background-color: var(--color-easy-bg);
      color: var(--color-easy);
    }
    .verdict-fail {
      background-color: var(--color-hard-bg);
      color: var(--color-hard);
    }
    .sub-prob-link {
      font-weight: 500;
      color: var(--color-text-primary);
    }
    .sub-prob-link:hover {
      color: var(--color-accent);
    }

    @media (max-width: 900px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .content-split-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProgressComponent {
  progressService = inject(ProgressService);
  submissionService = inject(SubmissionService);

  stats = this.progressService.stats;
  topicProgress = this.progressService.topicProgress;
}
