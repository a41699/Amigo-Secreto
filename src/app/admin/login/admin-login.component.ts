import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h1>Login Admin</h1>
        <p class="subtitle">Acesso restrito à gestão de participantes e sorteios.</p>

        @if (erro) {
          <div class="alert alert-error">{{ erro }}</div>
        }

        <form (ngSubmit)="entrar()" class="login-form">
          <label for="username">Utilizador</label>
          <input
            id="username"
            type="text"
            name="username"
            [(ngModel)]="username"
            autocomplete="username"
            required
          />

          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            [(ngModel)]="password"
            autocomplete="current-password"
            required
          />

          <button type="submit" [disabled]="aEntrar || !username.trim() || !password">
            {{ aEntrar ? 'A entrar...' : 'Entrar' }}
          </button>
        </form>

        <a routerLink="/" class="back-link">Voltar ao início</a>
      </div>
    </div>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
      }
      .login-card {
        width: min(430px, 100%);
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
      }
      h1 {
        margin: 0;
      }
      .subtitle {
        margin: 0.5rem 0 1rem;
        color: #6b7280;
      }
      .login-form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }
      label {
        font-weight: 600;
        margin-top: 0.5rem;
      }
      input {
        border: 1px solid #d1d5db;
        border-radius: 8px;
        padding: 0.75rem;
        font-size: 1rem;
      }
      input:focus {
        outline: 2px solid #fecaca;
        border-color: #dc2626;
      }
      button {
        margin-top: 1rem;
        border: 0;
        border-radius: 8px;
        padding: 0.75rem 1rem;
        background: #b91c1c;
        color: #fff;
        font-weight: 600;
        cursor: pointer;
      }
      button:hover:not(:disabled) {
        background: #991b1b;
      }
      button:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .back-link {
        display: inline-block;
        margin-top: 1rem;
        color: #6b7280;
        text-decoration: none;
      }
      .back-link:hover {
        color: #111827;
      }
    `,
  ],
})
export class AdminLoginComponent {
  username = '';
  password = '';
  erro = '';
  aEntrar = false;

  constructor(private auth: AuthService, private router: Router) {}

  entrar() {
    this.erro = '';
    this.aEntrar = true;

    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => {
        this.router.navigateByUrl('/admin');
        this.aEntrar = false;
      },
      error: (e) => {
        this.erro = e.error?.erro || 'Erro ao autenticar.';
        this.aEntrar = false;
      },
      complete: () => {
        this.aEntrar = false;
      },
    });
  }
}
