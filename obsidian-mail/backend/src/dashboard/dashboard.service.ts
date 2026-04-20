import { Injectable } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class DashboardService {
  constructor(private readonly docker: DockerService) {}

  async getStats() {
    const info = await this.docker.getContainerInfo();

    if (!info) {
      return {
        status: 'stopped',
        uptime: '—',
        version: '—',
        queueSize: 0,
        totalMailboxes: 0,
        totalDomains: 0,
        lastActivity: '—',
      };
    }

    // Get mailbox count
    const mailboxResult = await this.docker.runSetup(['email', 'list']);
    const mailboxLines = mailboxResult.stdout.split('\n').filter(l => l.includes('@'));

    // Get queue size
    const queueResult = await this.docker.exec(['postqueue', '-p']);
    const queueMatch = queueResult.stdout.match(/(\d+)\s+Requests?/i);
    const queueSize = queueMatch ? parseInt(queueMatch[1], 10) : 0;

    // Get domains
    const domainResult = await this.docker.runSetup(['email', 'list']);
    const domains = new Set(
      mailboxLines.map(l => {
        const parts = l.trim().split(/\s+/);
        const email = parts.find(p => p.includes('@')) || '';
        return email.split('@')[1];
      }).filter(Boolean)
    );

    const started = info.State?.StartedAt ? new Date(info.State.StartedAt) : null;
    const uptime = started ? this.formatUptime(Date.now() - started.getTime()) : '—';

    const envVars: Record<string, string> = {};
    if (info?.Config?.Env) {
      for (const e of info.Config.Env) {
        const [key, ...rest] = e.split('=');
        envVars[key] = rest.join('=');
      }
    }

    const isRunning = info?.State?.Running;
    const services = [
      { name: 'Postfix',  subtitle: 'MTA Engine',      icon: 'send',       status: isRunning ? 'running' : 'stopped' },
      { name: 'Dovecot',  subtitle: 'IMAP/POP3',       icon: 'inbox',      status: isRunning ? 'running' : 'stopped' },
      { name: 'Rspamd',   subtitle: 'Spam Filter',      icon: 'security',   status: isRunning && envVars['ENABLE_RSPAMD'] === '1' ? 'running' : 'inactive' },
      { name: 'ClamAV',   subtitle: 'Antivirus',        icon: 'coronavirus',status: isRunning && envVars['ENABLE_CLAMAV'] === '1' ? 'running' : 'inactive' },
      { name: 'Fail2ban', subtitle: 'IP Ban Manager',   icon: 'block',      status: isRunning && envVars['ENABLE_FAIL2BAN'] === '1' ? 'active' : 'inactive' },
    ];

    return {
      status: info.State?.Running ? 'running' : 'stopped',
      uptime,
      version: info.Config?.Image ?? '—',
      queueSize,
      totalMailboxes: mailboxLines.length,
      totalDomains: domains.size,
      lastActivity: new Date().toISOString(),
      services,
    };
  }

  async getQueue() {
    const result = await this.docker.exec(['postqueue', '-j']);
    if (!result.stdout) return [];

    try {
      return result.stdout
        .split('\n')
        .filter(Boolean)
        .map(line => {
          const msg = JSON.parse(line);
          return {
            id: msg.queue_id,
            from: msg.sender,
            to: msg.recipients?.[0]?.address ?? '',
            subject: '',
            size: msg.message_size ?? 0,
            timestamp: new Date(msg.arrival_time * 1000).toISOString(),
            status: msg.queue_name === 'deferred' ? 'deferred' : 'queued',
          };
        });
    } catch {
      return [];
    }
  }

  async getThroughput(): Promise<{ label: string; sent: number; received: number }[]> {
<<<<<<< Updated upstream
    const result = await this.docker.exec([
      'grep', '-E', 'postfix/(smtp|lmtp|virtual)\\[.*status=sent',
      '/var/log/mail/mail.log',
=======
    // Find the mail log regardless of path (/var/log/mail/mail.log or /var/log/mail.log)
    const logFinder = "log=/var/log/mail/mail.log; [ -f \"$log\" ] || log=/var/log/mail.log; [ -f \"$log\" ] || log=$(ls /var/log/mail/*.log 2>/dev/null | head -1)";
    // Extract hour robustly: works for both traditional (14:30:00) and ISO (T14:30:00) formats
    const hourExtract = "grep -oE '[0-9]{2}:[0-9]{2}:[0-9]{2}' | cut -d: -f1 | sort | uniq -c";

    const [sentResult, recvResult] = await Promise.all([
      this.docker.exec([
        'sh', '-c',
        `${logFinder}; grep -h 'postfix/smtp\\[' "$log" 2>/dev/null | grep 'status=sent' | ${hourExtract} || echo ''`,
      ]),
      this.docker.exec([
        'sh', '-c',
        `${logFinder}; grep -hE 'postfix/(lmtp|virtual)\\[' "$log" 2>/dev/null | grep 'status=sent' | ${hourExtract} || echo ''`,
      ]),
>>>>>>> Stashed changes
    ]);

    const now = new Date();
    const cutoff = new Date(now.getTime() - 12 * 3600 * 1000);

    // Build 12 hour buckets keyed by UTC year-month-day-hour
    const buckets: { label: string; sent: number; received: number; key: string }[] = [];
    for (let i = 11; i >= 0; i--) {
      const h = new Date(now.getTime() - i * 3600000);
      buckets.push({
        label: `${h.getUTCHours().toString().padStart(2, '0')}:00`,
        sent: 0,
        received: 0,
        key: `${h.getUTCFullYear()}-${h.getUTCMonth()}-${h.getUTCDate()}-${h.getUTCHours()}`,
      });
    }

    for (const line of result.stdout.split('\n').filter(Boolean)) {
      // ISO 8601 format: "2026-03-24T14:54:19.123456+00:00 host service[pid]: ..."
      const m = line.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):/);
      if (!m) continue;

      const logDate = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:00:00Z`);
      if (logDate < cutoff || logDate > now) continue;

      const key = `${logDate.getUTCFullYear()}-${logDate.getUTCMonth()}-${logDate.getUTCDate()}-${logDate.getUTCHours()}`;
      const bucket = buckets.find(b => b.key === key);
      if (!bucket) continue;

      if (/postfix\/smtp\[/.test(line)) {
        bucket.sent++;
      } else {
        bucket.received++;
      }
    }

    return buckets.map(({ label, sent, received }) => ({ label, sent, received }));
  }

  private formatUptime(ms: number): string {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
}
