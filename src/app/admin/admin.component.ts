import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule, RouterOutlet],
  template: `
    <div class="admin-layout">
      <nav class="admin-nav">
        <div class="admin-nav-links">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="admin-nav-link">
            Participantes
          </a>
          <a routerLink="/admin/sorteio" routerLinkActive="active" class="admin-nav-link">Sorteio</a>
        </div>
      </nav>
      <main class="admin-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .admin-layout {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }
      .admin-nav {
        background: var(--nav-bg, #1a1a2e);
        padding: 1rem 2rem;
        display: flex;
        gap: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }
      .admin-nav a {
        color: var(--nav-link, #e8e8e8);
        text-decoration: none;
        font-weight: 500;
        padding: 0.5rem 1rem;
        border-radius: 6px;
        transition: background 0.2s;
      }
      .admin-nav a:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      .admin-nav a.active {
        background: var(--accent, #e94560);
        color: white;
      }
      .admin-content {
        flex: 1;
        padding: 2rem;
        max-width: 900px;
        margin: 0 auto;
        width: 100%;
      }
    `,
  ],
})
export class AdminComponent {}
