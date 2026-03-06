import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-page home-page">
      <section class="home-hero">
        <div class="container">
          <div class="home-hero-card">
            <p class="home-kicker">Natal 2026</p>
            <h1 class="home-title">Amigo Secreto Seguro</h1>
            <p class="home-subtitle">
              Organize o sorteio, partilhe chaves privadas e deixe cada pessoa descobrir o resultado em segurança.
            </p>

            <div class="home-actions">
              <a routerLink="/consulta" class="btn btn-primary btn-lg">
                Descobrir o meu amigo secreto
              </a>
              <a routerLink="/admin" class="btn btn-secondary btn-lg">
                Área de administração
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .home-page {
        position: relative;
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--spacing-xl) var(--spacing-lg);
      }

      .home-hero {
        width: 100%;
        padding: 0;
        position: relative;
        z-index: 1;
      }

      .home-hero-card {
        max-width: 840px;
        margin: 0 auto;
        text-align: center;
        padding: clamp(1.5rem, 4vw, 3rem);
        border-radius: var(--radius-xl);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.92), rgba(248, 249, 250, 0.9));
        backdrop-filter: blur(14px);
        border: 1px solid rgba(255, 255, 255, 0.85);
        box-shadow: 0 24px 50px rgba(15, 20, 30, 0.14);
      }

      .home-kicker {
        margin: 0 0 var(--spacing-sm);
        font-size: 0.9rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: var(--primary);
      }

      .home-title {
        margin-bottom: var(--spacing-md);
        line-height: 1.08;
        padding-bottom: 0.06em;
        font-size: clamp(2.4rem, 6vw, 4.2rem);
        background: linear-gradient(130deg, var(--primary), #c41f3a 45%, var(--secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .home-subtitle {
        max-width: 650px;
        margin: 0 auto var(--spacing-sm);
        font-size: clamp(1rem, 2vw, 1.25rem);
        color: var(--text);
        opacity: 0.9;
      }

      .home-actions {
        margin-top: var(--spacing-xl);
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
        gap: var(--spacing-md);
      }

      @media (max-width: 768px) {
        .home-page {
          padding: var(--spacing-lg);
        }

        .home-hero-card {
          padding: var(--spacing-xl) var(--spacing-lg);
        }

        .home-actions {
          width: 100%;
          flex-direction: column;
          align-items: stretch;
        }

        .home-actions .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class HomeComponent {}
