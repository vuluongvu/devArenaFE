import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ProblemService } from '../../core/services/problem.service';

interface NavGroup {
  title: string;
  items: {
    label: string;
    route: string;
    queryParams?: Record<string, string>;
    icon: string;
    badge?: string;
  }[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <aside
      class="sidebar-container"
      [class.collapsed]="isCollapsed"
      [class.mobile-open]="isOpen"
      [attr.aria-expanded]="!isCollapsed"
    >
      <!-- Sidebar Header with Collapse Toggle -->
      <div class="sidebar-top-bar">
        <div class="sidebar-top-info" *ngIf="!isCollapsed">
          <span class="sidebar-top-title">Navigation</span>
        </div>
        <button
          type="button"
          class="sidebar-toggle-btn"
          (click)="toggleCollapse.emit()"
          [title]="isCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'"
          [attr.aria-label]="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <app-icon
            [name]="isCollapsed ? 'panel-left-open' : 'panel-left-close'"
            [size]="17"
          ></app-icon>
        </button>
      </div>

      <div class="sidebar-scroll">
        <!-- Documentation-style Navigation Groups -->
        <div class="nav-section" *ngFor="let group of navGroups">
          <div class="section-title" *ngIf="!isCollapsed">{{ group.title }}</div>
          <div class="section-divider" *ngIf="isCollapsed"></div>
          <ul class="nav-list">
            <li *ngFor="let item of group.items" class="nav-item">
              <a
                [routerLink]="item.route"
                [queryParams]="item.queryParams"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: !item.queryParams && item.route !== '/problems' }"
                (click)="onItemClick()"
                class="nav-link"
                [attr.title]="item.label + (item.badge ? ' (' + item.badge + ')' : '')"
              >
                <span class="indicator-bar" *ngIf="!isCollapsed"></span>
                <app-icon [name]="item.icon" [size]="18" customClass="item-icon"></app-icon>
                <span class="link-label" *ngIf="!isCollapsed">{{ item.label }}</span>
                <span *ngIf="item.badge && !isCollapsed" class="count-badge">{{ item.badge }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Topics Accordion -->
        <div class="nav-section">
          <!-- Expanded Mode: Accordion Header -->
          <div
            *ngIf="!isCollapsed"
            class="section-title-row"
            (click)="isTopicsCollapsed = !isTopicsCollapsed"
          >
            <span class="section-title">TOPICS & DATA STRUCTURES</span>
            <app-icon
              [name]="isTopicsCollapsed ? 'chevron-right' : 'chevron-down'"
              [size]="14"
              customClass="text-muted"
            ></app-icon>
          </div>

          <!-- Collapsed Mode: Section Divider & Quick Link -->
          <div class="section-divider" *ngIf="isCollapsed"></div>
          <ul class="nav-list" *ngIf="isCollapsed">
            <li class="nav-item">
              <a
                routerLink="/problems"
                class="nav-link"
                title="Browse Topics & Data Structures"
                (click)="onItemClick()"
              >
                <app-icon name="tag" [size]="18" customClass="item-icon"></app-icon>
              </a>
            </li>
          </ul>

          <!-- Expanded Mode: Topics List -->
          <ul class="nav-list" *ngIf="!isCollapsed && !isTopicsCollapsed">
            <li *ngFor="let topic of problemService.categories()" class="nav-item">
              <a
                [routerLink]="['/problems']"
                [queryParams]="{ category: topic }"
                routerLinkActive="active"
                (click)="onItemClick()"
                class="nav-link topic-link"
                [title]="topic"
              >
                <span class="indicator-bar"></span>
                <span class="link-label">{{ topic }}</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Editorial Practice Tips Box (Only visible in expanded mode) -->
        <div class="sidebar-tip-box" *ngIf="!isCollapsed">
          <div class="tip-header">
            <app-icon name="sparkles" [size]="14" customClass="text-accent"></app-icon>
            <span class="tip-title">Deliberate Practice</span>
          </div>
          <p class="tip-content">
            Focus on understanding invariants and complexity bounds before writing code. Aim for clean O(N) or O(log N) solutions.
          </p>
        </div>
      </div>
    </aside>

    <!-- Mobile Overlay Backdrop -->
    <div
      *ngIf="isOpen"
      class="sidebar-overlay"
      (click)="closeSidebar.emit()"
      aria-hidden="true"
    ></div>
  `,
  styles: [`
    .sidebar-container {
      width: 272px;
      height: calc(100vh - 60px);
      position: sticky;
      top: 60px;
      background-color: var(--color-sidebar);
      border-right: 1px solid var(--color-border);
      flex-shrink: 0;
      transition: width 200ms cubic-bezier(0.16, 1, 0.3, 1), background-color var(--transition-normal);
      z-index: 90;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .sidebar-container.collapsed {
      width: 64px;
    }
    .sidebar-top-bar {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px 0 16px;
      border-bottom: 1px solid var(--color-border);
      flex-shrink: 0;
    }
    .sidebar-container.collapsed .sidebar-top-bar {
      justify-content: center;
      padding: 0;
    }
    .sidebar-top-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }
    .sidebar-toggle-btn {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      color: var(--color-text-secondary);
      background: transparent;
      cursor: pointer;
      transition: color var(--transition-fast), background-color var(--transition-fast), border-color var(--transition-fast);
    }
    .sidebar-toggle-btn:hover {
      color: var(--color-text-primary);
      background-color: var(--color-surface-hover);
      border-color: var(--color-border);
    }
    .sidebar-scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px 12px 32px 12px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .sidebar-container.collapsed .sidebar-scroll {
      padding: 12px 8px 32px 8px;
      align-items: center;
      gap: 14px;
    }
    .nav-section {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: 100%;
    }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
      text-transform: uppercase;
      padding: 0 10px 4px 10px;
    }
    .section-divider {
      width: 28px;
      height: 1px;
      background-color: var(--color-border);
      margin: 4px auto;
    }
    .section-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      padding: 2px 6px 4px 0;
    }
    .section-title-row:hover .section-title {
      color: var(--color-text-secondary);
    }
    .nav-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2px;
      width: 100%;
    }
    .nav-item {
      position: relative;
      width: 100%;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px;
      border-radius: var(--radius-sm);
      font-size: 14px;
      font-weight: 500;
      color: var(--color-text-secondary);
      transition: color var(--transition-fast), background-color var(--transition-fast);
      position: relative;
      text-decoration: none;
    }
    .nav-link:hover {
      color: var(--color-text-primary);
      background-color: var(--color-surface-hover);
    }
    .sidebar-container.collapsed .nav-link {
      width: 44px;
      height: 40px;
      padding: 0;
      justify-content: center;
      align-items: center;
      margin: 0 auto;
    }
    .indicator-bar {
      position: absolute;
      left: 0;
      top: 6px;
      bottom: 6px;
      width: 2.5px;
      border-radius: 2px;
      background-color: transparent;
      transition: background-color var(--transition-fast);
    }
    .nav-link.active {
      color: var(--color-accent);
      background-color: var(--color-accent-subtle);
      font-weight: 600;
    }
    .nav-link.active .indicator-bar {
      background-color: var(--color-accent);
    }
    .item-icon {
      color: var(--color-text-muted);
      transition: color var(--transition-fast);
      flex-shrink: 0;
    }
    .nav-link:hover .item-icon {
      color: var(--color-text-primary);
    }
    .nav-link.active .item-icon {
      color: var(--color-accent);
    }
    .link-label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .count-badge {
      font-size: 11px;
      font-weight: 600;
      color: var(--color-text-muted);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: 1px 6px;
      border-radius: var(--radius-xs);
    }
    .topic-link {
      padding-left: 20px;
      font-size: 13.5px;
    }
    .sidebar-tip-box {
      margin-top: auto;
      padding: 14px;
      border-radius: var(--radius-md);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
    }
    .tip-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
    }
    .tip-title {
      font-size: 12.5px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .tip-content {
      font-size: 12px;
      line-height: 1.5;
      color: var(--color-text-secondary);
    }

    /* Mobile Drawer */
    @media (max-width: 860px) {
      .sidebar-container {
        position: fixed;
        left: 0;
        top: 60px;
        bottom: 0;
        width: 280px !important;
        transform: translateX(-100%);
        box-shadow: var(--shadow-modal);
        transition: transform 220ms cubic-bezier(0.16, 1, 0.3, 1), background-color var(--transition-normal);
        z-index: 95;
      }
      .sidebar-container.mobile-open {
        transform: translateX(0);
      }
      .sidebar-container.collapsed {
        width: 280px !important;
      }
      .sidebar-overlay {
        position: fixed;
        inset: 0;
        top: 60px;
        background-color: rgba(0, 0, 0, 0.45);
        backdrop-filter: blur(2px);
        z-index: 90;
      }
      .sidebar-container .sidebar-top-bar {
        display: flex;
        justify-content: space-between;
        padding: 0 16px;
      }
      .sidebar-container .sidebar-top-info {
        display: block !important;
      }
      .sidebar-container .sidebar-scroll {
        padding: 16px;
        align-items: stretch;
      }
      .sidebar-container .nav-link {
        width: 100% !important;
        height: auto !important;
        justify-content: flex-start !important;
        padding: 8px 12px !important;
      }
      .sidebar-container .link-label {
        display: inline !important;
      }
      .sidebar-container .section-title {
        display: block !important;
      }
      .sidebar-container .section-title-row {
        display: flex !important;
      }
      .sidebar-container .count-badge {
        display: inline-block !important;
      }
      .sidebar-container .sidebar-tip-box {
        display: block !important;
      }
      .sidebar-container .section-divider {
        display: none !important;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() isCollapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();

  problemService = inject(ProblemService);
  isTopicsCollapsed = false;

  readonly navGroups: NavGroup[] = [
    {
      title: 'GETTING STARTED',
      items: [
        { label: 'Overview', route: '/', icon: 'compass' },
        { label: 'All Problems', route: '/problems', icon: 'code', badge: '10' }
      ]
    },
    {
      title: 'ALGORITHMS CORE',
      items: [
        { label: 'Visualizer Studio', route: '/visualizer', icon: 'layers' },
        { label: 'Curricula & Paths', route: '/curricula', icon: 'book' }
      ]
    },
    {
      title: 'MY DASHBOARD',
      items: [
        { label: 'Solve Progress', route: '/progress', icon: 'bar-chart' },
        { label: 'Solved Problems', route: '/problems', queryParams: { status: 'SOLVED' }, icon: 'check-circle' }
      ]
    }
  ];

  onItemClick(): void {
    if (window.innerWidth <= 860) {
      this.closeSidebar.emit();
    }
  }
}