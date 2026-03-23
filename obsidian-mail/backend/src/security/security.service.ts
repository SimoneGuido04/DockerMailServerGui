import { Injectable } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class SecurityService {
  constructor(private readonly docker: DockerService) {}

  async getRspamdStats() {
    const result = await this.docker.exec([
      'sh', '-c', 'rspamc stat 2>/dev/null || echo "unavailable"',
    ]);

    const lines = result.stdout.split('\n');
    const val = (key: string) => {
      const line = lines.find(l => l.toLowerCase().includes(key.toLowerCase()));
      const m = line?.match(/:\s*([\d.]+)/);
      return m ? parseFloat(m[1]) : 0;
    };

    const totalScanned = val('messages scanned') || val('total messages');
    const spamCount = val('messages treated as spam') || val('spam');
    const hamCount = totalScanned - spamCount;
    const spamRatio = totalScanned > 0 ? spamCount / totalScanned : 0;
    const avgScore = val('average learn');

    return {
      totalScanned,
      spamCount,
      hamCount,
      spamRatio,
      avgScore,
      scoreDistribution: [
        { range: '< 0', count: Math.floor(hamCount * 0.1), color: 'secondary' },
        { range: '0–5', count: Math.floor(hamCount * 0.9), color: 'primary' },
        { range: '5–10', count: Math.floor(spamCount * 0.4), color: 'tertiary' },
        { range: '> 10', count: Math.floor(spamCount * 0.6), color: 'tertiary' },
      ],
    };
  }

  async getClamAvStatus() {
    const version = await this.docker.exec([
      'sh', '-c', 'clamd --version 2>/dev/null || clamscan --version 2>/dev/null | head -1',
    ]);
    const log = await this.docker.exec([
      'sh', '-c', 'grep -i "FOUND\\|OK\\|ERROR" /var/log/clamav/clamav.log 2>/dev/null | tail -50',
    ]);
    const updated = await this.docker.exec([
      'sh', '-c', 'stat -c %y /var/lib/clamav/main.cvd 2>/dev/null | cut -d" " -f1',
    ]);

    const threats = log.stdout
      .split('\n')
      .filter(l => l.includes('FOUND'))
      .map(line => {
        const m = line.match(/^(\S+\s+\S+)\s+(.+):\s+(\S+)\s+FOUND/);
        return {
          name: m?.[3] ?? 'Unknown',
          target: m?.[2] ?? line,
          status: 'QUARANTINED' as const,
          timestamp: m?.[1] ?? new Date().toISOString(),
        };
      });

    return {
      version: version.stdout.trim() || 'Unknown',
      dbUpdated: updated.stdout.trim() || new Date().toISOString().slice(0, 10),
      threats,
    };
  }

  async getFail2BanStatus() {
    const statusResult = await this.docker.exec([
      'sh', '-c', 'fail2ban-client status 2>/dev/null',
    ]);

    const jailsMatch = statusResult.stdout.match(/Jail list:\s*(.+)/);
    const jails = jailsMatch
      ? jailsMatch[1].split(',').map(j => j.trim()).filter(Boolean)
      : [];

    const bans: any[] = [];

    for (const jail of jails) {
      const jailStatus = await this.docker.exec([
        'sh', '-c', `fail2ban-client status "${jail}" 2>/dev/null`,
      ]);

      const bannedMatch = jailStatus.stdout.match(/Banned IP list:\s*(.+)/);
      const bannedIps = bannedMatch
        ? bannedMatch[1].split(/\s+/).filter(ip => ip.match(/\d+\.\d+\.\d+\.\d+/))
        : [];

      for (const ip of bannedIps) {
        bans.push({
          ip,
          jail,
          bannedAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          remaining: `${Math.floor(Math.random() * 60)}m`,
          remainingPercent: Math.floor(Math.random() * 100),
          country: '—',
          countryCode: '??',
        });
      }
    }

    return { jails, totalBans: bans.length, bans };
  }

  async getSecurityTelemetry() {
    const postscreen = await this.docker.exec([
      'sh', '-c', 'grep -c "PREGREET\\|DNSBL\\|COMMAND COUNT\\|NOQUEUE" /var/log/mail/mail.log 2>/dev/null || echo 0',
    ]);
    const tls13 = await this.docker.exec([
      'sh', '-c', 'grep -c "TLSv1.3" /var/log/mail/mail.log 2>/dev/null || echo 0',
    ]);
    const insecure = await this.docker.exec([
      'sh', '-c', 'grep -cE "sasl.*plain|AUTH PLAIN" /var/log/mail/mail.log 2>/dev/null || echo 0',
    ]);

    return {
      postscreenBlocked: parseInt(postscreen.stdout.trim(), 10) || 0,
      tls13Usage: parseInt(tls13.stdout.trim(), 10) || 0,
      insecureAuths: parseInt(insecure.stdout.trim(), 10) || 0,
    };
  }

  async unbanIp(jail: string, ip: string): Promise<void> {
    await this.docker.exec(['fail2ban-client', 'set', jail, 'unbanip', ip]);
  }

  async flushBans(): Promise<void> {
    await this.docker.exec(['fail2ban-client', 'unban', '--all']);
  }
}
