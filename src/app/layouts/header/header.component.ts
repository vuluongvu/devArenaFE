import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SearchModalComponent } from '../../shared/components/search-modal/search-modal.component';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, SearchModalComponent],
  template: `
    <header class="app-header">
      <div class="header-inner">
        <!-- Left: Brand Wordmark -->
        <div class="brand-group">
          <a routerLink="/" class="brand-link">
            <span class="brand-title">DevArena</span>
          </a>

          <!-- Primary Navigation Links -->
          <nav class="nav-links">
            <a
              routerLink="/problems"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: false }"
              class="nav-item"
            >
              Problems
            </a>
            <a
              routerLink="/visualizer"
              routerLinkActive="active"
              class="nav-item"
            >
              Visualizer
            </a>
            <a
              routerLink="/curricula"
              routerLinkActive="active"
              class="nav-item"
            >
              Curricula
            </a>
            <a
              routerLink="/progress"
              routerLinkActive="active"
              class="nav-item"
            >
              Progress
            </a>
          </nav>
        </div>

        <!-- Right: Search, Theme Toggle, Auth -->
        <div class="action-group">
          <!-- Search Button -->
          <button class="search-trigger-btn" (click)="isSearchOpen = true" title="Quick Search (Ctrl+K)">
            <app-icon name="search" [size]="16" customClass="text-secondary"></app-icon>
            <span class="search-placeholder">Search docs & algorithms...</span>
            <span class="kbd-pill">
              <abbr title="Press Ctrl+K to search">Ctrl K</abbr>
            </span>
          </button>

          <!-- Theme Toggle Button -->
          <button
            class="icon-btn theme-toggle"
            (click)="themeService.toggleTheme()"
            [title]="themeService.isDark() ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
            aria-label="Toggle theme"
          >
            <app-icon
              [name]="themeService.isDark() ? 'sun' : 'moon'"
              [size]="18"
            ></app-icon>
          </button>

          <!-- Authenticated State -->
          <div *ngIf="authService.currentUser() as user; else unauthBlock" class="user-menu-wrapper">
            <button
              class="user-profile-btn"
              (click)="isDropdownOpen = !isDropdownOpen"
              [attr.aria-expanded]="isDropdownOpen"
            >
              <div class="avatar-circle">
                {{ user.username.charAt(0).toUpperCase() }}
              </div>
              <span class="username-label">{{ user.username }}</span>
              <app-icon name="chevron-down" [size]="14" customClass="chevron-icon"></app-icon>
            </button>

            <!-- Dropdown Menu -->
            <div *ngIf="isDropdownOpen" class="user-dropdown" (click)="isDropdownOpen = false">
              <div class="dropdown-header">
                <span class="user-display">{{ user.username }}</span>
                <span class="user-email">{{ user.email || 'developer@devarena.io' }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <a routerLink="/progress" class="dropdown-item">
                <app-icon name="bar-chart" [size]="15"></app-icon>
                <span>My Progress</span>
              </a>
              <a routerLink="/problems" class="dropdown-item">
                <app-icon name="code" [size]="15"></app-icon>
                <span>All Practice Problems</span>
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item text-danger" (click)="authService.logout()">
                <app-icon name="logout" [size]="15"></app-icon>
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          <!-- Unauthenticated Buttons -->
          <ng-template #unauthBlock>
            <div class="auth-buttons">
              <a routerLink="/login" class="btn btn-ghost">Sign In</a>
              <a routerLink="/register" class="btn btn-primary">Get Started</a>
            </div>
          </ng-template>
        </div>
      </div>
    </header>

    <!-- Global Search Modal -->
    <app-search-modal
      [isOpen]="isSearchOpen"
      (closed)="isSearchOpen = false"
    ></app-search-modal>
  `,
  styles: [`
    .app-header {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 60px;
      background-color: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      transition: background-color var(--transition-normal), border-color var(--transition-normal);
    }
    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 28px;
      max-width: 1560px;
      margin: 0 auto;
    }
    .brand-group {
      display: flex;
      align-items: center;
      gap: 24px;
    }
    .brand-link {
      display: flex;
      align-items: center;
      text-decoration: none;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 750;
      letter-spacing: -0.025em;
      color: var(--color-text-primary);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .nav-item {
      position: relative;
      padding: 7px 14px;
      font-size: 14.5px;
      font-weight: 500;
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
      transition: color var(--transition-fast), background-color var(--transition-fast);
    }
    .nav-item:hover {
      color: var(--color-text-primary);
      background-color: var(--color-surface-hover);
    }
    .nav-item.active {
      color: var(--color-text-primary);
      font-weight: 600;
    }
    .nav-item.active::after {
      content: '';
      position: absolute;
      bottom: -15px;
      left: 14px;
      right: 14px;
      height: 2px;
      background-color: var(--color-accent);
      border-radius: 2px;
    }
    .action-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .search-trigger-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      height: var(--control-height-md);
      padding: 0 12px;
      background-color: var(--color-sidebar);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      font-size: 13.5px;
      transition: border-color var(--transition-fast), background-color var(--transition-fast);
      min-width: 260px;
    }
    .search-trigger-btn:hover {
      border-color: var(--color-border-hover);
      background-color: var(--color-surface-hover);
      color: var(--color-text-primary);
    }
    .search-placeholder {
      flex: 1;
      text-align: left;
    }
    .kbd-pill {
      font-size: 11px;
      font-weight: 600;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: 2px 6px;
      border-radius: var(--radius-xs);
      color: var(--color-text-muted);
    }
    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      color: var(--color-text-secondary);
      border: 1px solid var(--color-border);
      background-color: var(--color-surface);
      transition: all var(--transition-fast);
    }
    .icon-btn:hover {
      background-color: var(--color-surface-hover);
      color: var(--color-text-primary);
      border-color: var(--color-border-hover);
    }
    .user-menu-wrapper {
      position: relative;
    }
    .user-profile-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      height: var(--control-height-md);
      padding: 0 10px 0 6px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background-color: var(--color-surface);
      transition: background-color var(--transition-fast);
    }
    .user-profile-btn:hover {
      background-color: var(--color-surface-hover);
    }
    .avatar-circle {
      width: 26px;
      height: 26px;
      border-radius: var(--radius-full);
      background-color: var(--color-accent-subtle);
      color: var(--color-accent);
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .username-label {
      font-size: 13.5px;
      font-weight: 500;
      color: var(--color-text-primary);
      max-width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .user-dropdown {
      position: absolute;
      top: calc(100% + 6px);
      right: 0;
      width: 220px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-dropdown);
      padding: 8px;
      z-index: 200;
      animation: dropdownIn 0.15s ease-out;
    }
    @keyframes dropdownIn {
      from { opacity: 0; transform: translateY(-4px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .dropdown-header {
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
    }
    .user-display {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-primary);
    }
    .user-email {
      font-size: 12px;
      color: var(--color-text-muted);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .dropdown-divider {
      height: 1px;
      background-color: var(--color-border);
      margin: 6px 0;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 10px;
      font-size: 13.5px;
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
      transition: background-color var(--transition-fast), color var(--transition-fast);
      text-align: left;
    }
    .dropdown-item:hover {
      background-color: var(--color-surface-hover);
      color: var(--color-text-primary);
    }
    .dropdown-item.text-danger:hover {
      color: var(--color-hard);
    }
    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: var(--control-height-md);
      padding: 0 16px;
      font-size: 13.5px;
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: all var(--transition-fast);
      line-height: 1.25;
    }
    .btn-ghost {
      color: var(--color-text-secondary);
    }
    .btn-ghost:hover {
      color: var(--color-text-primary);
      background-color: var(--color-surface-hover);
    }
    .btn-primary {
      background-color: var(--color-accent);
      color: #FFFFFF;
    }
    .btn-primary:hover {
      background-color: var(--color-accent-hover);
    }

    @media (max-width: 900px) {
      .nav-links {
        display: none;
      }
      .search-placeholder {
        display: none;
      }
      .search-trigger-btn {
        min-width: auto;
        padding: 0 10px;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() isSidebarCollapsed = false;
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() toggleCollapse = new EventEmitter<void>();

  themeService = inject(ThemeService);
  authService = inject(AuthService);

  isSearchOpen = false;
  isDropdownOpen = false;
}
