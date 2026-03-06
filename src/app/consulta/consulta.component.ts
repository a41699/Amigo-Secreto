import { Component, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <div class="hero-decoration">
            <div class="snowflake">❄</div>
            <div class="snowflake">🎄</div>
            <div class="snowflake">❄</div>
            <div class="snowflake">🎅</div>
            <div class="snowflake">⭐</div>
            <div class="snowflake">🔔</div>
            <div class="snowflake">🎁</div>
            <div class="snowflake">🌟</div>
          </div>

          <h1 class="hero-title">
            <span class="title-main">Amigo Secreto</span>
            <span class="title-accent">Seguro</span>
          </h1>

          <p class="hero-subtitle">
            Descubra o seu amigo secreto de Natal de forma privada e segura
          </p>
        </div>
      </section>

      <!-- Main Form Section -->
      <section class="main-section">
        <div class="container">
          <div class="form-card">
            <div class="card-header">
              <h2 class="card-title">Descobrir Amigo Secreto</h2>
              <p class="card-subtitle">
                Introduza a chave única que recebeu para revelar o seu amigo secreto.
              </p>
            </div>

            <div class="card-body">
              <form class="secret-form" (ngSubmit)="consultar()">
                <div class="form-group">
                  <label for="token" class="form-label">Sua Chave Secreta</label>
                  <div class="input-wrapper">
                    <input
                      id="token"
                      type="text"
                      [(ngModel)]="token"
                      name="token"
                      placeholder="Introduza a sua chave aqui..."
                      class="form-control form-control-lg"
                      autocomplete="off"
                    />
                    <div class="input-icon">🔑</div>
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-lg btn-reveal"
                  [disabled]="!(token || '').trim() || aConsultar"
                >
                  <span class="btn-text">
                    {{ aConsultar ? 'Descobrindo...' : 'Revelar Amigo Secreto' }}
                  </span>
                  <span class="btn-icon">{{ aConsultar ? '⏳' : '🎉' }}</span>
                </button>
              </form>

              @if (erro) {
                <div class="alert alert-error alert-shake">
                  <div class="alert-icon">⚠️</div>
                  <div class="alert-content">
                    <div class="alert-title">Ops! Algo deu errado</div>
                    <div class="alert-message">{{ erro }}</div>
                  </div>
                </div>
              }

              @if (amigoSecreto) {
                <div class="result-card reveal-animation">
                  <div class="result-header">
                    <div class="result-icon">🎁</div>
                    <h3 class="result-title">Seu Amigo Secreto é:</h3>
                  </div>
                  <div class="result-name">
                    {{ amigoSecreto }}
                  </div>
                  <div class="result-footer">
                    <p>Boas compras! 🎄✨</p>
                  </div>
                </div>
              }
            </div>

            <div class="card-footer">
              <a routerLink="/admin" class="admin-link">
                <span class="admin-icon">⚙️</span>
                <span>Área Administrativa</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <p class="footer-text">
            Feito com ❤️ para tornar o Natal mais especial
          </p>
        </div>
      </footer>
    </div>
  `,
  styles: []
})
export class ConsultaComponent {
  token = '';
  amigoSecreto = '';
  erro = '';
  aConsultar = false;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef, private zone: NgZone) {}

  consultar() {
    const t = this.token?.trim();
    if (!t) return;

    this.aConsultar = true;
    this.erro = '';
    this.amigoSecreto = '';

    this.zone.run(() => {
      this.api.consultarAmigoSecreto(t).subscribe({
        next: (res) => {
          this.amigoSecreto = res.amigoSecreto;
          this.aConsultar = false;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.erro = e.error?.erro || 'Chave inválida ou expirada. Verifique e tente novamente.';
          this.aConsultar = false;
          this.cdr.detectChanges();
        },
        complete: () => {
          this.aConsultar = false;
        },
      });
    });
  }
}
