import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Participante } from '../../services/api.service';

@Component({
  selector: 'app-participantes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="participantes">
      <h1>Gestão de Participantes</h1>
      <p class="subtitle">Participantes inativos não entram no sorteio.</p>

      <form class="form-row" (ngSubmit)="adicionar()">
        <input
          type="text"
          [(ngModel)]="novoNome"
          name="novoNome"
          placeholder="Nome do participante"
          maxlength="100"
          class="form-control"
          (keyup.enter)="adicionar()"
        />
        <button type="submit" class="btn btn-primary" [disabled]="!(novoNome || '').trim() || aAdicionar">
          {{ aAdicionar ? 'A adicionar...' : 'Adicionar' }}
        </button>
      </form>

      @if (erro) {
        <div class="alert alert-error">{{ erro }}</div>
      }
      @if (sucesso) {
        <div class="alert alert-success">{{ sucesso }}</div>
      }

      <ul class="lista">
        @for (p of participantes; track p.id) {
          <li class="item" [class.inativo]="!p.ativo">
            @if (editandoId === p.id) {
              <input
                type="text"
                [(ngModel)]="editNome"
                (keyup.enter)="guardarEdicao(p)"
                (keyup.escape)="cancelarEdicao()"
                class="input-edit"
              />
              <button type="button" (click)="guardarEdicao(p)">Guardar</button>
              <button type="button" class="btn-sec" (click)="cancelarEdicao()">Cancelar</button>
            } @else {
              <span class="nome">{{ p.nome }}</span>
              @if (p.pending) {
                <span class="data">(a guardar...)</span>
              } @else {
              <span class="data">{{ p.dataAtualizacao | date : 'dd/MM/yyyy HH:mm' }}</span>
              }
              <button
                type="button"
                (click)="toggleAtivo(p)"
                [class.btn-inativo]="p.ativo"
                [title]="p.ativo ? 'Desativar' : 'Ativar'"
                [disabled]="aToggleId === p.id || p.pending"
              >
                {{ p.ativo ? 'Desativar' : 'Ativar' }}
              </button>
              <button type="button" (click)="iniciarEdicao(p)" [disabled]="p.pending">Editar</button>
              <button
                type="button"
                class="btn-apagar"
                (click)="apagar(p)"
                title="Remover definitivamente"
                [disabled]="aApagarId === p.id || p.pending"
              >
                {{ aApagarId === p.id ? 'A apagar...' : 'Apagar' }}
              </button>
            }
          </li>
        } @empty {
          <li class="vazio">Ainda não há participantes. Adicione o primeiro!</li>
        }
      </ul>
    </div>
  `,
  styles: [
    `
      .participantes h1 {
        margin-bottom: 0.25rem;
      }
      .subtitle {
        color: var(--text-muted, #888);
        margin-bottom: 1.5rem;
      }
      .form-add {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
      }
      .form-add input {
        flex: 1;
        padding: 0.75rem 1rem;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
      }
      .form-add button {
        padding: 0.75rem 1.25rem;
        background: var(--accent, #e94560);
        color: white;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
      }
      .form-add button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
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
      .lista {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 0.5rem;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      .item.inativo {
        opacity: 0.6;
      }
      .item .nome {
        flex: 1;
        font-weight: 500;
      }
      .item .data {
        font-size: 0.875rem;
        color: #6b7280;
      }
      .item button {
        padding: 0.4rem 0.75rem;
        border-radius: 6px;
        border: 1px solid #d1d5db;
        background: white;
        cursor: pointer;
        font-size: 0.875rem;
      }
      .item button:hover {
        background: #f3f4f6;
      }
      .item .btn-apagar {
        color: #dc2626;
        border-color: #fecaca;
      }
      .item .btn-apagar:hover {
        background: #fef2f2;
      }
      .item .btn-inativo {
        background: #10b981;
        color: white;
        border-color: #10b981;
      }
      .input-edit {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid #3b82f6;
        border-radius: 6px;
      }
      .btn-sec {
        background: #f3f4f6 !important;
      }
      .vazio {
        padding: 2rem;
        text-align: center;
        color: #6b7280;
        background: #f9fafb;
        border-radius: 8px;
        border: 1px dashed #d1d5db;
      }
    `,
  ],
})
export class ParticipantesComponent implements OnInit {
  participantes: (Participante & { pending?: boolean })[] = [];
  novoNome = '';
  editandoId: string | null = null;
  editNome = '';
  erro = '';
  sucesso = '';
  aAdicionar = false;
  aApagarId: string | null = null;
  aToggleId: string | null = null;

  constructor(private api: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.api.getParticipantes().subscribe({
      next: (lista) => {
        this.participantes = lista;
        this.cdr.detectChanges();
      },
      error: () => {
        this.erro = 'Erro ao carregar participantes.';
        this.cdr.detectChanges();
      },
    });
  }

  adicionar() {
    const nome = this.novoNome?.trim();
    if (!nome) return;

    this.erro = '';
    this.sucesso = '';
    this.aAdicionar = true;

    const agora = new Date().toISOString();
    let uuid: string | null = null;
    try {
      uuid = globalThis.crypto?.randomUUID?.() ?? null;
    } catch {
      uuid = null;
    }
    if (!uuid) {
      uuid = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
    const tempId = `temp-${uuid}`;
    const temp: Participante & { pending?: boolean } = {
      id: tempId,
      nome,
      ativo: true,
      dataCriacao: agora,
      dataAtualizacao: agora,
      pending: true,
    };
    // Mostrar imediatamente na lista
    this.participantes = [temp, ...this.participantes];
    // Limpar já o input para o utilizador poder escrever o próximo
    this.novoNome = '';

    this.api.criarParticipante(nome).subscribe({
      next: (novo) => {
        this.sucesso = 'Participante adicionado com sucesso.';
        // Substituir placeholder pelo registo real
        this.participantes = this.participantes.map((p) => (p.id === tempId ? novo : p));
        this.aAdicionar = false;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.erro = e.error?.erro || e.message || 'Erro ao adicionar. O servidor está a correr?';
        // Remover placeholder
        this.participantes = this.participantes.filter((p) => p.id !== tempId);
        this.aAdicionar = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.aAdicionar = false;
      },
    });
  }

  iniciarEdicao(p: Participante) {
    this.editandoId = p.id;
    this.editNome = p.nome;
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.editNome = '';
  }

  guardarEdicao(p: Participante) {
    const nome = this.editNome?.trim();
    if (!nome) return;

    this.api.atualizarParticipante(p.id, { nome }).subscribe({
      next: () => {
        this.cancelarEdicao();
        this.sucesso = 'Participante atualizado.';
        this.carregar();
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.erro = e.error?.erro || 'Erro ao atualizar.';
        this.cdr.detectChanges();
      },
    });
  }

  toggleAtivo(p: Participante) {
    if ((p as any).pending) return;
    this.aToggleId = p.id;
    this.api.toggleAtivoParticipante(p.id, !p.ativo).subscribe({
      next: () => {
        this.sucesso = p.ativo ? 'Participante desativado.' : 'Participante ativado.';
        this.carregar();
        this.aToggleId = null;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.erro = e.error?.erro || 'Erro ao alterar estado.';
        this.aToggleId = null;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.aToggleId = null;
      },
    });
  }

  apagar(p: Participante) {
    if ((p as any).pending) return;
    this.aApagarId = p.id;
    const backup = this.participantes;
    // Remover imediatamente
    this.participantes = this.participantes.filter((x) => x.id !== p.id);
    this.cdr.detectChanges();

    this.api.apagarParticipante(p.id).subscribe({
      next: () => {
        this.sucesso = 'Participante removido.';
        this.aApagarId = null;
        this.cdr.detectChanges();
      },
      error: (e) => {
        this.erro = e.error?.erro || 'Erro ao remover.';
        // Repor lista se falhou
        this.participantes = backup;
        this.aApagarId = null;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.aApagarId = null;
      },
    });
  }
}
