import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ServerStats, Mailbox, CreateMailboxDto, Alias,
  Domain, ServerSetting, QueueMessage, ApiResponse
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  // ── Dashboard ────────────────────────────────────────────────────────────

  getServerStats(): Observable<ServerStats> {
    return this.http.get<ApiResponse<ServerStats>>(`${this.base}/dashboard/stats`)
      .pipe(map(r => r.data));
  }

  getQueue(): Observable<QueueMessage[]> {
    return this.http.get<ApiResponse<QueueMessage[]>>(`${this.base}/dashboard/queue`)
      .pipe(map(r => r.data));
  }

  // ── Mailboxes ────────────────────────────────────────────────────────────

  getMailboxes(): Observable<Mailbox[]> {
    return this.http.get<ApiResponse<Mailbox[]>>(`${this.base}/mailboxes`)
      .pipe(map(r => r.data));
  }

  createMailbox(dto: CreateMailboxDto): Observable<void> {
    return this.http.post<void>(`${this.base}/mailboxes`, dto);
  }

  deleteMailbox(email: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/mailboxes/${encodeURIComponent(email)}`);
  }

  updatePassword(email: string, password: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/mailboxes/${encodeURIComponent(email)}/password`, { password });
  }

  // ── Aliases ──────────────────────────────────────────────────────────────

  getAliases(): Observable<Alias[]> {
    return this.http.get<ApiResponse<Alias[]>>(`${this.base}/aliases`)
      .pipe(map(r => r.data));
  }

  createAlias(alias: string, destination: string): Observable<void> {
    return this.http.post<void>(`${this.base}/aliases`, { alias, destination });
  }

  deleteAlias(alias: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/aliases/${encodeURIComponent(alias)}`);
  }

  // ── Domains ──────────────────────────────────────────────────────────────

  getDomains(): Observable<Domain[]> {
    return this.http.get<ApiResponse<Domain[]>>(`${this.base}/domains`)
      .pipe(map(r => r.data));
  }

  // ── Settings ─────────────────────────────────────────────────────────────

  getSettings(): Observable<ServerSetting[]> {
    return this.http.get<ApiResponse<ServerSetting[]>>(`${this.base}/settings`)
      .pipe(map(r => r.data));
  }

  updateSetting(key: string, value: string): Observable<void> {
    return this.http.put<void>(`${this.base}/settings/${key}`, { value });
  }
}
