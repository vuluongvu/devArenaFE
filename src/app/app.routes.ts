import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { ProblemsComponent } from './pages/problems/problems.component';
import { WorkspaceComponent } from './pages/workspace/workspace.component';
import { LearnComponent } from './pages/learn/learn.component';
import { ProgressComponent } from './pages/progress/progress.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';

export const routes: Routes = [
  // Full-viewport specialized coding workspace (no general sidebar, dedicated IDE shell)
  {
    path: 'problems/:slug',
    component: WorkspaceComponent,
    title: 'DevArena — Workspace'
  },

  // Main application shell (NestJS-docs inspired header, sidebar, and layout)
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        title: 'DevArena — Algorithmic Learning & Practice'
      },
      {
        path: 'problems',
        component: ProblemsComponent,
        title: 'DevArena — Problem Archive'
      },
      {
        path: 'visualizer',
        component: LearnComponent,
        data: { tab: 'visualizer' },
        title: 'DevArena — Visualizer Studio'
      },
      {
        path: 'curricula',
        component: LearnComponent,
        data: { tab: 'curricula' },
        title: 'DevArena — Curricula & Paths'
      },
      {
        path: 'learn',
        redirectTo: 'visualizer',
        pathMatch: 'full'
      },
      {
        path: 'progress',
        component: ProgressComponent,
        title: 'DevArena — Solve Progress & Metrics'
      },
      {
        path: 'login',
        component: LoginComponent,
        title: 'DevArena — Sign In'
      },
      {
        path: 'register',
        component: RegisterComponent,
        title: 'DevArena — Get Started'
      }
    ]
  },

  // Wildcard fallback
  {
    path: '**',
    redirectTo: ''
  }
];
