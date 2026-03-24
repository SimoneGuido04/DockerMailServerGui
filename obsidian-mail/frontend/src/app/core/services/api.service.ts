import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';
import {
  ServerStats, Mailbox, CreateMailboxDto, Alias,
  Domain, ServerSetting, QueueMessage, ApiResponse,
  DnsRecord, AuthStatus, CertificateInfo, LetsEncryptStatus,
  DaneStatus, CertSummary, RspamdStats, ClamAvStatus,
  Fail2BanStatus, SecurityTelemetry, LogSource, LogEntry, LogStats,
  ThroughputPoint
} from '../models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly oauthService = inject(OAuthService);
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

  getThroughput(): Observable<ThroughputPoint[]> {
    return this.http.get<ApiResponse<ThroughputPoint[]>>(`${this.base}/dashboard/throughput`)
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

  // ── DNS ───────────────────────────────────────────────────────────────────

  getDnsRecords(): Observable<DnsRecord[]> {
    return this.http.get<ApiResponse<DnsRecord[]>>(`${this.base}/dns/records`)
      .pipe(map(r => r.data));
  }

  getAuthStatus(): Observable<AuthStatus> {
    return this.http.get<ApiResponse<AuthStatus>>(`${this.base}/dns/auth-status`)
      .pipe(map(r => r.data));
  }

  // ── Certificates ──────────────────────────────────────────────────────────

  getCertificate(): Observable<CertificateInfo> {
    return this.http.get<ApiResponse<CertificateInfo>>(`${this.base}/certificates`)
      .pipe(map(r => r.data));
  }

  getCertificateList(): Observable<CertificateInfo[]> {
    return this.http.get<ApiResponse<CertificateInfo[]>>(`${this.base}/certificates/list`)
      .pipe(map(r => r.data));
  }

  getLetsEncryptStatus(): Observable<LetsEncryptStatus> {
    return this.http.get<ApiResponse<LetsEncryptStatus>>(`${this.base}/certificates/letsencrypt`)
      .pipe(map(r => r.data));
  }

  getCertSummary(): Observable<CertSummary> {
    return this.http.get<ApiResponse<CertSummary>>(`${this.base}/certificates/summary`)
      .pipe(map(r => r.data));
  }

  getDaneStatus(): Observable<DaneStatus> {
    return this.http.get<ApiResponse<DaneStatus>>(`${this.base}/certificates/dane`)
      .pipe(map(r => r.data));
  }

  requestCertificate(domain?: string): Observable<void> {
    return this.http.post<void>(`${this.base}/certificates/request`, { domain });
  }

  uploadPem(formData: FormData): Observable<void> {
    return this.http.post<void>(`${this.base}/certificates/upload`, formData);
  }

  // ── Security ──────────────────────────────────────────────────────────────

  getRspamdStats(): Observable<RspamdStats> {
    return this.http.get<ApiResponse<RspamdStats>>(`${this.base}/security/rspamd`)
      .pipe(map(r => r.data));
  }

  getClamAvStatus(): Observable<ClamAvStatus> {
    return this.http.get<ApiResponse<ClamAvStatus>>(`${this.base}/security/clamav`)
      .pipe(map(r => r.data));
  }

  getFail2BanStatus(): Observable<Fail2BanStatus> {
    return this.http.get<ApiResponse<Fail2BanStatus>>(`${this.base}/security/fail2ban`)
      .pipe(map(r => r.data));
  }

  getSecurityTelemetry(): Observable<SecurityTelemetry> {
    return this.http.get<ApiResponse<SecurityTelemetry>>(`${this.base}/security/telemetry`)
      .pipe(map(r => r.data));
  }

  unbanIp(jail: string, ip: string): Observable<void> {
    return this.http.post<void>(`${this.base}/security/fail2ban/unban/${encodeURIComponent(ip)}`, { jail });
  }

  flushBans(): Observable<void> {
    return this.http.post<void>(`${this.base}/security/fail2ban/flush`, {});
  }

  // ── Logs ──────────────────────────────────────────────────────────────────

  getLogSources(): Observable<LogSource[]> {
    return this.http.get<ApiResponse<LogSource[]>>(`${this.base}/logs/sources`)
      .pipe(map(r => r.data));
  }

  searchLogs(query: string, source: string): Observable<LogEntry[]> {
    return this.http.get<ApiResponse<LogEntry[]>>(`${this.base}/logs/search`, {
      params: { q: query, source }
    }).pipe(map(r => r.data));
  }

  getLogStats(): Observable<LogStats> {
    return this.http.get<ApiResponse<LogStats>>(`${this.base}/logs/stats`)
      .pipe(map(r => r.data));
  }

  /**
   * Opens an SSE stream for live log tailing.
   * Uses fetch() + ReadableStream to support Authorization header
   * (native EventSource does not support custom headers).
   * Returns an Observable<LogEntry> that emits parsed log lines.
   * Unsubscribing closes the fetch connection.
   */
  streamLogs(source: string, severities: string[]): Observable<LogEntry> {
    return new Observable<LogEntry>(subscriber => {
      const controller = new AbortController();
      const token = this.getAuthToken();
      const params = new URLSearchParams({
        source,
        severity: severities.join(','),
      });

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token.idToken}`,
        Accept: 'text/event-stream',
      };
      if (token.accessToken) headers['X-Zitadel-Access-Token'] = token.accessToken;

      fetch(`${this.base}/logs/stream?${params}`, {
        headers,
        signal: controller.signal,
      }).then(async response => {
        if (!response.ok || !response.body) {
          subscriber.error(new Error(`SSE error: ${response.status}`));
          return;
        }
        const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) { subscriber.complete(); break; }

          buffer += value;
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const entry: LogEntry = JSON.parse(line.slice(6));
                subscriber.next(entry);
              } catch { /* skip malformed */ }
            }
          }
        }
      }).catch(err => {
        if (err.name !== 'AbortError') subscriber.error(err);
      });

      return () => controller.abort();
    });
  }

  private getAuthToken(): { idToken: string; accessToken: string } {
    return {
      idToken: this.oauthService.getIdToken() ?? '',
      accessToken: this.oauthService.getAccessToken() ?? '',
    };
  }
}
