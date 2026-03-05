import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';

export interface Participante {
  id: string;
  nome: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface Sorteio {
  id: string;
  dataSorteio: string;
  estado: string;
  dataCriacao: string;
}

export interface TokenSorteio {
  participanteNome: string;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = '/api';
  private requestTimeoutMs = 10000;

  constructor(private http: HttpClient) {}

  // Participantes
  getParticipantes(): Observable<Participante[]> {
    return this.http
      .get<Participante[]>(`${this.baseUrl}/participantes`)
      .pipe(timeout(this.requestTimeoutMs));
  }

  criarParticipante(nome: string): Observable<Participante> {
    return this.http
      .post<Participante>(`${this.baseUrl}/participantes`, { nome })
      .pipe(timeout(this.requestTimeoutMs));
  }

  atualizarParticipante(id: string, dados: Partial<Participante>): Observable<Participante> {
    return this.http
      .put<Participante>(`${this.baseUrl}/participantes/${id}`, dados)
      .pipe(timeout(this.requestTimeoutMs));
  }

  apagarParticipante(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.baseUrl}/participantes/${id}`)
      .pipe(timeout(this.requestTimeoutMs));
  }

  toggleAtivoParticipante(id: string, ativo: boolean): Observable<Participante> {
    return this.http
      .patch<Participante>(`${this.baseUrl}/participantes/${id}/ativar`, { ativo })
      .pipe(timeout(this.requestTimeoutMs));
  }

  // Sorteio
  getSorteios(): Observable<Sorteio[]> {
    return this.http
      .get<Sorteio[]>(`${this.baseUrl}/sorteio`)
      .pipe(timeout(this.requestTimeoutMs));
  }

  temSorteioAtivo(): Observable<{ temSorteioAtivo: boolean }> {
    return this.http
      .get<{ temSorteioAtivo: boolean }>(`${this.baseUrl}/sorteio/ativos`)
      .pipe(timeout(this.requestTimeoutMs));
  }

  gerarSorteio(): Observable<{
    id: string;
    tokens: TokenSorteio[];
    mensagem: string;
  }> {
    return this.http
      .post<{
        id: string;
        tokens: TokenSorteio[];
        mensagem: string;
      }>(`${this.baseUrl}/sorteio`, {})
      .pipe(timeout(this.requestTimeoutMs));
  }

  inativarSorteio(id: string): Observable<{ mensagem: string }> {
    return this.http
      .patch<{ mensagem: string }>(`${this.baseUrl}/sorteio/${id}/inativar`, {})
      .pipe(timeout(this.requestTimeoutMs));
  }

  // Consulta pública
  consultarAmigoSecreto(token: string): Observable<{ amigoSecreto: string }> {
    return this.http
      .post<{ amigoSecreto: string }>(`${this.baseUrl}/consulta`, { token })
      .pipe(timeout(this.requestTimeoutMs));
  }
}
