import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { MarkdownPipe } from '../../shared/pipes/markdown.pipe';
import { ProblemService } from '../../core/services/problem.service';
import { ProgressService } from '../../core/services/progress.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, BadgeComponent, MarkdownPipe],
  template: `
    <div class="home-container">
      <!-- Editorial Hero Section -->
      <section class="hero-section">
        <div class="hero-meta-badge">
          <app-icon name="sparkles" [size]="13" customClass="text-accent"></app-icon>
          <span>ENGINEERING BENCHMARKS & PRACTICE</span>
        </div>
        <h1 class="hero-title">
          Deliberate algorithmic practice for software engineers.
        </h1>
        <p class="hero-subtitle">
          DevArena combines the focused problem catalog of NeetCode with the clean, editorial ergonomics of NestJS documentation. Master data structures, algorithmic invariants, and automated code evaluations.
        </p>

        <div class="hero-actions">
          <a routerLink="/problems" class="btn btn-primary">
            <span>Explore Problems</span>
            <app-icon name="chevron-right" [size]="14"></app-icon>
          </a>
          <a routerLink="/learn" class="btn btn-secondary">
            <span>Structured Paths</span>
          </a>
        </div>
      </section>

      <!-- Daily Pick & Featured Benchmark -->
      <section class="daily-pick-card" *ngIf="featuredProblem as p">
        <div class="pick-header">
          <div class="pick-tag">
            <app-icon name="flame" [size]="13" customClass="text-accent"></app-icon>
            <span>DAILY BENCHMARK</span>
          </div>
          <app-badge [difficulty]="p.difficulty"></app-badge>
        </div>

        <div class="pick-body">
          <div class="pick-info">
            <h2 class="pick-title">{{ p.title }}</h2>
            <div class="pick-desc markdown-body" [innerHTML]="p.statement.split('\\n\\n')[0] | markdown"></div>
            <div class="pick-tags">
              <span class="category-pill">{{ p.category }}</span>
              <span *ngFor="let t of p.tags" class="tag-pill">{{ t }}</span>
            </div>
          </div>
          <div class="pick-action">
            <a [routerLink]="['/problems', p.slug]" class="btn btn-primary solve-btn">
              <span>Start Problem</span>
              <app-icon name="chevron-right" [size]="14"></app-icon>
            </a>
          </div>
        </div>
      </section>

      <!-- Key Engineering Principles Grid -->
      <section class="principles-grid">
        <div class="principle-card">
          <div class="principle-icon">
            <app-icon name="terminal" [size]="18"></app-icon>
          </div>
          <h3 class="principle-title">Automated Sandbox Evaluation</h3>
          <p class="principle-text">
            Execute solutions across TypeScript, JavaScript, Python, C++, and Java with isolated Judge0 evaluation, instant execution time metrics, and memory bounds.
          </p>
        </div>

        <div class="principle-card">
          <div class="principle-icon">
            <app-icon name="layers" [size]="18"></app-icon>
          </div>
          <h3 class="principle-title">Structured Learning Paths</h3>
          <p class="principle-text">
            Avoid random grinding. Progress systematically through curated topics: hash lookup tables, two pointers, sliding window boundaries, and dynamic programming tabulation.
          </p>
        </div>

        <div class="principle-card">
          <div class="principle-icon">
            <app-icon name="sparkles" [size]="18"></app-icon>
          </div>
          <h3 class="principle-title">Editorial Walkthroughs</h3>
          <p class="principle-text">
            Every core problem features verified solutions with detailed asymptotic analyses ($O(N)$ runtime and $O(1)$ space constraints) to build lasting problem-solving intuition.
          </p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      display: flex;
      flex-direction: column;
      gap: 36px;
    }
    .hero-section {
      max-width: 760px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 10px 0 20px 0;
    }
    .hero-meta-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--color-accent);
      background-color: var(--color-accent-subtle);
      border: 1px solid var(--color-accent-border);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      width: fit-content;
    }
    .hero-title {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.25;
      color: var(--color-text-primary);
    }
    .hero-subtitle {
      font-size: 16px;
      line-height: 1.65;
      color: var(--color-text-secondary);
    }
    .hero-actions {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 8px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      height: var(--control-height-md);
      padding: 0 18px;
      font-size: 14px;
      font-weight: 600;
      border-radius: var(--radius-sm);
      transition: all var(--transition-fast);
    }
    .btn-primary {
      background-color: var(--color-accent);
      color: #FFFFFF;
    }
    .btn-primary:hover {
      background-color: var(--color-accent-hover);
    }
    .btn-secondary {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
    }
    .btn-secondary:hover {
      background-color: var(--color-surface-hover);
      border-color: var(--color-border-hover);
    }

    /* Daily Pick Card */
    .daily-pick-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 24px 28px;
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .pick-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .pick-tag {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
    }
    .pick-body {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 28px;
    }
    .pick-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 760px;
    }
    .pick-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--color-text-primary);
    }
    .pick-desc {
      font-size: 14px;
      color: var(--color-text-secondary);
      line-height: 1.6;
    }
    .pick-tags {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 6px;
    }
    .category-pill {
      font-size: 12px;
      font-weight: 600;
      color: var(--color-text-primary);
      background-color: var(--color-sidebar);
      border: 1px solid var(--color-border);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }
    .tag-pill {
      font-size: 12px;
      color: var(--color-text-muted);
      background-color: var(--color-bg);
      border: 1px solid var(--color-border-subtle);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
    }
    .solve-btn {
      white-space: nowrap;
    }

    /* Principles Grid */
    .principles-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .principle-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      box-shadow: var(--shadow-sm);
    }
    .principle-icon {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background-color: var(--color-sidebar);
      border: 1px solid var(--color-border);
      color: var(--color-text-primary);
    }
    .principle-title {
      font-size: 16px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .principle-text {
      font-size: 14px;
      line-height: 1.6;
      color: var(--color-text-secondary);
    }

    @media (max-width: 860px) {
      .hero-title {
        font-size: 26px;
      }
      .pick-body {
        flex-direction: column;
        align-items: flex-start;
      }
      .principles-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  private problemService = inject(ProblemService);
  featuredProblem = this.problemService.problemsList()[0];
}
