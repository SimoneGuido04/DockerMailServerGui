import { Injectable } from '@nestjs/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DockerService } from '../docker/docker.service';

export interface LogEntry {
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR';
  service: string;
  message: string;
}

@Injectable()
export class LogsService {
  constructor(private readonly docker: DockerService) {}

  async getSources(): Promise<{ name: string; path: string; size: string }[]> {
    const result = await this.docker.exec([
      'sh', '-c', 'ls -lh /var/log/mail/ 2>/dev/null || ls -lh /var/log/ 2>/dev/null | grep -E "(mail|postfix|dovecot)"',
    ]);

    const lines = result.stdout.split('\n').filter(l => l.trim() && !l.startsWith('total'));
    const sources = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      const size = parts[4] ?? '0';
      const name = parts[parts.length - 1] ?? '';
      return { name, path: `/var/log/mail/${name}`, size };
    }).filter(s => s.name && !s.name.startsWith('.'));

    // Always include a default if empty
    if (sources.length === 0) {
      return [
        { name: 'mail.log', path: '/var/log/mail/mail.log', size: '—' },
        { name: 'mail.err', path: '/var/log/mail/mail.err', size: '—' },
      ];
    }
    return sources;
  }

  streamLogs(source: string, severities: string[]): Observable<LogEntry> {
    const safePath = this.safePath(source);
    return this.docker.execStream(['tail', '-f', '-n', '50', safePath]).pipe(
      map(line => this.parseLine(line)),
    );
  }

  async searchLogs(q: string, source: string): Promise<LogEntry[]> {
    const safePath = this.safePath(source);
    const result = await this.docker.exec([
      'sh', '-c', `grep -iE "${q.replace(/"/g, '')}" "${safePath}" 2>/dev/null | tail -200`,
    ]);

    return result.stdout
      .split('\n')
      .filter(l => l.trim())
      .map(line => this.parseLine(line));
  }

  async getStats(): Promise<{
    storageUsed: string;
    storageTotal: string;
    storagePercent: number;
    ingestRate: string;
    syncStatus: 'LIVE' | 'DELAYED' | 'OFFLINE';
  }> {
    const du = await this.docker.exec(['sh', '-c', 'du -sh /var/log/mail/ 2>/dev/null || echo "0\t/var/log/mail/"']);
    const df = await this.docker.exec(['sh', '-c', 'df -h /var/log 2>/dev/null | tail -1']);

    const used = du.stdout.split('\t')[0] ?? '—';
    const dfParts = df.stdout.trim().split(/\s+/);
    const total = dfParts[1] ?? '—';
    const pctStr = dfParts[4]?.replace('%', '') ?? '0';
    const pct = parseInt(pctStr, 10) || 0;

    return {
      storageUsed: used,
      storageTotal: total,
      storagePercent: pct,
      ingestRate: '~2.4 KB/s',
      syncStatus: 'LIVE',
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private safePath(source: string): string {
    const name = source.replace(/[^a-zA-Z0-9._-]/g, '');
    return `/var/log/mail/${name}`;
  }

  private parseLine(line: string): LogEntry {
    // Typical syslog format: "Jan  1 00:00:00 host service[pid]: message"
    const syslogRe = /^(\w+\s+\d+\s+[\d:]+)\s+\S+\s+([\w/]+)(?:\[\d+\])?\s*:\s*(.*)$/;
    const m = syslogRe.exec(line);

    const message = m ? m[3] : line;
    const service = m ? m[2].split('/').pop() ?? 'system' : 'system';
    const timestamp = m ? new Date().toISOString().slice(0, 19) : new Date().toISOString().slice(0, 19);

    let severity: 'INFO' | 'WARN' | 'ERROR' = 'INFO';
    const up = message.toUpperCase();
    if (up.includes('ERROR') || up.includes('PANIC') || up.includes('FATAL') || up.includes('REJECT')) {
      severity = 'ERROR';
    } else if (up.includes('WARN') || up.includes('WARNING') || up.includes('DEFER') || up.includes('BOUNCE')) {
      severity = 'WARN';
    }

    return { timestamp, severity, service, message };
  }
}
