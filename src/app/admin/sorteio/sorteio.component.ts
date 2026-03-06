import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, Participante, Sorteio, TokenSorteio } from '../../services/api.service';

@Component({
  selector: 'app-sorteio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="sorteio">
      <h1>Gerar Sorteio</h1>
      <p class="subtitle">
        São necessários pelo menos 3 participantes ativos. O resultado é guardado de forma
        encriptada.
      </p>

      @if (erro) {
        <div class="alert alert-error">{{ erro }}</div>
      }
      @if (sucesso) {
        <div class="alert alert-success">{{ sucesso }}</div>
      }

      @if (tokens.length > 0) {
        <div class="tokens-box">
          <h2>Chaves de consulta</h2>
          <p>
            Distribua a cada participante a sua chave. Cada um pode consultar o amigo secreto em
            <a routerLink="/consulta" target="_blank">/consulta</a>.
          </p>
          <div class="tokens-list">
            @for (t of tokens; track t.token) {
              <div class="token-item">
                <span class="nome">{{ t.participanteNome }}</span>
                <code class="token">{{ t.token }}</code>
                <button type="button" (click)="copiar(t.token)" title="Copiar">
                  {{ copiado === t.token ? 'Copiado!' : 'Copiar' }}
                </button>
              </div>
            }
          </div>
          <button type="button" class="btn-fechar" (click)="fecharTokens()">Fechar</button>
        </div>
      }

      @if (!temSorteioAtivo && tokens.length === 0) {
        <div class="acoes">
          <button
            type="button"
            class="btn-gerar"
            (click)="gerarSorteio()"
          >
            {{ aGerar ? 'A gerar...' : 'Gerar Sorteio' }}
          </button>
          <span class="info">
            {{ participantesAtivos }} participante(s) ativo(s)
            @if (participantesAtivos < 3) {
              (mínimo 3)
            }
          </span>
        </div>
      }

      @if (temSorteioAtivo && tokens.length === 0) {
        <div class="sorteio-ativo">
          <p>Existe um sorteio ativo. Para criar um novo, inative o atual.</p>
          @for (s of sorteios; track s.id) {
            @if (s.estado === 'ativo') {
              <button
                type="button"
                class="btn-inativar"
                (click)="inativarSorteio(s)"
                [disabled]="aInativar"
              >
                Inativar sorteio de {{ s.dataSorteio | date : 'dd/MM/yyyy HH:mm' }}
              </button>
            }
          }
        </div>
      }

      @if (sorteios.length > 0) {
        <div class="historico">
          <h2>Histórico de Sorteios</h2>
          <ul>
            @for (s of sorteios; track s.id) {
              <li [class.ativo]="s.estado === 'ativo'">
                <div class="sorteio-info">
                  <span class="data">{{ s.dataSorteio | date : 'dd/MM/yyyy HH:mm' }}</span>
                  <span class="estado" [class.ativo]="s.estado === 'ativo'">{{ s.estado }}</span>
                </div>
                <div class="sorteio-acoes">
                  @if (s.estado === 'ativo') {
                    <button
                      type="button"
                      class="btn-inativar"
                      (click)="inativarSorteio(s)"
                      [disabled]="aInativar"
                    >
                      {{ aInativar ? 'A desativar...' : 'Desativar' }}
                    </button>
                  }
                  <button
                    type="button"
                    class="btn-remover"
                    (click)="apagarSorteio(s)"
                    [disabled]="aApagar"
                  >
                    {{ aApagar ? 'A remover...' : 'Remover' }}
                  </button>
                </div>
              </li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .sorteio h1 {
        margin-bottom: 0.25rem;
      }
      .subtitle {
        color: var(--text-muted, #888);
        margin-bottom: 1.5rem;
      }
      .msg {
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
      }
      .msg.erro {
        background: #fee2e2;
        color: #b91c1c;
      }
      .msg.sucesso {
        background: #d1fae5;
        color: #065f46;
      }
      .tokens-box {
        background: #f0fdf4;
        border: 1px solid #86efac;
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 2rem;
      }
      .tokens-box h2 {
        margin-top: 0;
        color: #166534;
      }
      .tokens-box a {
        color: #15803d;
        font-weight: 600;
      }
      .tokens-list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        margin: 1rem 0;
      }
      .token-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .token-item .nome {
        min-width: 120px;
        font-weight: 500;
      }
      .token-item .token {
        flex: 1;
        min-width: 200px;
        font-size: 0.8rem;
        padding: 0.5rem;
        background: white;
        border-radius: 6px;
        word-break: break-all;
      }
      .token-item button {
        padding: 0.4rem 0.75rem;
        border-radius: 6px;
        border: 1px solid #22c55e;
        background: white;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .token-item button:hover {
        background: #dcfce7;
      }
      .btn-fechar {
        margin-top: 1rem;
        padding: 0.5rem 1rem;
        background: #22c55e;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
      }
      .acoes {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .btn-gerar {
        padding: 1rem 2rem;
        font-size: 1.1rem;
        background: var(--accent, #e94560);
        color: white;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        cursor: pointer;
        align-self: flex-start;
      }
      .btn-gerar:hover:not(:disabled) {
        filter: brightness(1.1);
      }
      .btn-gerar:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .info {
        color: #6b7280;
      }
      .sorteio-ativo {
        padding: 1.5rem;
        background: #fef3c7;
        border: 1px solid #fcd34d;
        border-radius: 10px;
      }
      .btn-inativar {
        padding: 0.5rem 1rem;
        background: #f59e0b;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
      }
      .btn-inativar:hover:not(:disabled) {
        background: #d97706;
      }
      .btn-inativar:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn-remover {
        padding: 0.5rem 1rem;
        background: #dc2626;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
      }
      .btn-remover:hover:not(:disabled) {
        background: #b91c1c;
      }
      .btn-remover:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .historico {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e5e7eb;
      }
      .historico h2 {
        font-size: 1.15rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #111827;
      }
      .historico ul {
        list-style: none;
        padding: 0;
      }
      .historico li {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 0.5rem;
      }
      .historico li.ativo {
        background: #f0f9ff;
        border-color: #7dd3fc;
      }
      .sorteio-info {
        display: flex;
        gap: 1rem;
        align-items: center;
        flex: 1;
      }
      .sorteio-info .data {
        font-weight: 500;
        color: #111827;
      }
      .sorteio-info .estado {
        padding: 0.25rem 0.75rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 600;
        background: #f3f4f6;
        color: #6b7280;
      }
      .sorteio-info .estado.ativo {
        background: #dbeafe;
        color: #0369a1;
      }
      .sorteio-acoes {
        display: flex;
        gap: 0.5rem;
      }
    `,
  ],
})
export class SorteioComponent implements OnInit {
  participantesAtivos = 0;
  temSorteioAtivo = false;
  sorteios: Sorteio[] = [];
  tokens: TokenSorteio[] = [];
  aGerar = false;
  aInativar = false;
  aApagar = false;
  erro = '';
  sucesso = '';
  copiado = '';

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.erro = '';
    this.api.getParticipantes().subscribe({
      next: (lista) => {
        this.participantesAtivos = lista.filter((p) => p.ativo).length;
        this.cdr.detectChanges();
      },
    });
    this.api.temSorteioAtivo().subscribe({
      next: (r) => {
        this.temSorteioAtivo = r.temSorteioAtivo;
        this.cdr.detectChanges();
      },
    });
    this.api.getSorteios().subscribe({
      next: (lista) => {
        this.sorteios = lista;
        this.cdr.detectChanges();
      },
    });
  }

  gerarSorteio() {
    this.aGerar = true;
    this.erro = '';
    this.sucesso = '';

    this.api.gerarSorteio().subscribe({
      next: (res) => {
        this.tokens = res.tokens;
        this.temSorteioAtivo = true;
        this.sucesso = res.mensagem;
        this.carregar();
        this.aGerar = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.erro = e.error?.erro || 'Erro ao gerar sorteio.';
        this.aGerar = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.aGerar = false;
      },
    });
  }

  inativarSorteio(s: Sorteio) {
    this.aInativar = true;
    this.erro = '';
    this.api.inativarSorteio(s.id).subscribe({
      next: () => {
        this.temSorteioAtivo = false;
        this.sucesso = 'Sorteio desativado. Pode gerar um novo.';
        this.carregar();
        this.aInativar = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.erro = e.error?.erro || 'Erro ao desativar.';
        this.aInativar = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.aInativar = false;
      },
    });
  }

  apagarSorteio(s: Sorteio) {
    const confirmado = window.confirm(
      `Tem a certeza que quer remover o sorteio de ${new Date(s.dataSorteio).toLocaleString()}?`
    );
    if (!confirmado) return;

    this.aApagar = true;
    this.erro = '';
    this.sucesso = '';

    this.api.apagarSorteio(s.id).subscribe({
      next: () => {
        if (s.estado === 'ativo') {
          this.temSorteioAtivo = false;
        }
        this.sucesso = 'Sorteio removido com sucesso.';
        this.carregar();
        this.aApagar = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.erro = e.error?.erro || 'Erro ao remover sorteio.';
        this.aApagar = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.aApagar = false;
      },
    });
  }

  copiar(token: string) {
    navigator.clipboard.writeText(token).then(() => {
      this.copiado = token;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.copiado = '';
        this.cdr.detectChanges();
      }, 2000);
    });
  }

  fecharTokens() {
    this.tokens = [];
    this.carregar();
    this.cdr.detectChanges();
  }
}
