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
      mailboxLines.map(l => l.trim().split('@')[1]).filter(Boolean)
    );

    const started = info.State?.StartedAt ? new Date(info.State.StartedAt) : null;
    const uptime = started ? this.formatUptime(Date.now() - started.getTime()) : '—';

    return {
      status: info.State?.Running ? 'running' : 'stopped',
      uptime,
      version: info.Config?.Image ?? '—',
      queueSize,
      totalMailboxes: mailboxLines.length,
      totalDomains: domains.size,
      lastActivity: new Date().toISOString(),
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

  private formatUptime(ms: number): string {
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }
}
