import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidebarComponent],
  template: `
    <div class="layout-wrapper">
      <app-header
        [isSidebarCollapsed]="isSidebarCollapsed"
        (toggleSidebar)="isMobileSidebarOpen = !isMobileSidebarOpen"
        (toggleCollapse)="toggleSidebarCollapse()"
      ></app-header>
      
      <div class="layout-body">
        <app-sidebar
          [isOpen]="isMobileSidebarOpen"
          [isCollapsed]="isSidebarCollapsed"
          (closeSidebar)="isMobileSidebarOpen = false"
          (toggleCollapse)="toggleSidebarCollapse()"
        ></app-sidebar>

        <main class="main-content-area" [class.sidebar-collapsed]="isSidebarCollapsed">
          <div class="content-container">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--color-bg);
    }
    .layout-body {
      display: flex;
      flex: 1;
      width: 100%;
      min-height: 0;
    }
    .main-content-area {
      flex: 1;
      min-width: 0;
      padding: 36px 48px 72px 48px;
      overflow-y: auto;
      transition: padding 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }
    .main-content-area.sidebar-collapsed {
      padding: 36px 40px 72px 40px;
    }
    .content-container {
      max-width: 1520px;
      margin: 0 auto;
      width: 100%;
      transition: max-width 200ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    @media (max-width: 1200px) {
      .main-content-area {
        padding: 32px 32px 64px 32px;
      }
      .main-content-area.sidebar-collapsed {
        padding: 32px 28px 64px 28px;
      }
    }

    @media (max-width: 860px) {
      .main-content-area,
      .main-content-area.sidebar-collapsed {
        padding: 24px 18px 48px 18px;
      }
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  isMobileSidebarOpen = false;
  isSidebarCollapsed = false;

  constructor(private router: Router) {
    // Automatically close mobile slide-out drawer on navigation
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isMobileSidebarOpen = false;
      });
  }

  ngOnInit(): void {
    const saved = localStorage.getItem('devarena_sidebar_collapsed');
    if (saved !== null) {
      this.isSidebarCollapsed = saved === 'true';
    }
  }

  toggleSidebarCollapse(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem('devarena_sidebar_collapsed', String(this.isSidebarCollapsed));
    // Trigger resize event after transition begins/ends so children (e.g. Monaco/editors, charts) resize
    window.dispatchEvent(new Event('resize'));
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 220);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    // Ctrl+B or Cmd+B to toggle sidebar collapse
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag !== 'input' && activeTag !== 'textarea') {
        event.preventDefault();
        this.toggleSidebarCollapse();
      }
    }
  }
}
