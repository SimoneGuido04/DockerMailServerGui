import { Injectable } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';

@Injectable()
export class DnsService {
  constructor(private readonly docker: DockerService) {}

  async getDnsRecords(): Promise<{ type: string; host: string; value: string; status: string }[]> {
    const info = await this.docker.getContainerInfo();
    const env = this.parseEnvVars(info?.Config?.Env ?? []);

    const hostname = env['HOSTNAME'] ?? env['DOMAINNAME'] ?? 'mail.example.com';
    const domain = hostname.split('.').slice(-2).join('.');
    const records: { type: string; host: string; value: string; status: string }[] = [];

    // SPF
    records.push({
      type: 'SPF',
      host: domain,
      value: `v=spf1 mx a:${hostname} -all`,
      status: 'ok',
    });

    // DKIM — read the public key
    const dkimKey = await this.docker.exec([
      'sh', '-c', `cat /tmp/docker-mailserver/opendkim/keys/${domain}/mail.txt 2>/dev/null || cat /etc/opendkim/keys/${domain}/mail.txt 2>/dev/null`,
    ]);

    if (dkimKey.stdout.trim()) {
      // Extract just the p= value from the TXT record
      const pMatch = dkimKey.stdout.match(/p=([A-Za-z0-9+/=\s]+)/);
      const pVal = pMatch ? pMatch[0].replace(/\s+/g, '') : 'p=<key>';
      records.push({
        type: 'DKIM',
        host: `mail._domainkey.${domain}`,
        value: `v=DKIM1; k=rsa; ${pVal}`,
        status: 'ok',
      });
    } else {
      records.push({
        type: 'DKIM',
        host: `mail._domainkey.${domain}`,
        value: 'Not generated — run: setup config dkim',
        status: 'warning',
      });
    }

    // DMARC
    records.push({
      type: 'DMARC',
      host: `_dmarc.${domain}`,
      value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}; ruf=mailto:dmarc@${domain}; sp=quarantine; adkim=s; aspf=s`,
      status: 'ok',
    });

    return records;
  }

  async getAuthStatus(): Promise<{
    spf: string;
    dkimAlignment: number;
    dmarcPolicy: string;
    tlsVersion: string;
  }> {
    const info = await this.docker.getContainerInfo();
    const env = this.parseEnvVars(info?.Config?.Env ?? []);

    // Check postconf for TLS
    const postconf = await this.docker.exec([
      'sh', '-c', 'postconf smtpd_tls_protocols 2>/dev/null',
    ]);

    const protocols = postconf.stdout.toLowerCase();
    const tlsVersion = protocols.includes('tlsv1.3') ? 'TLS 1.3' : protocols.includes('tlsv1.2') ? 'TLS 1.2' : 'TLS 1.2';

    const dkimEnabled = env['ENABLE_OPENDKIM'] === '1' || env['ENABLE_DKIM'] === '1';
    const dmarcEnabled = env['ENABLE_OPENDMARC'] === '1' || env['ENABLE_DMARC'] === '1';

    return {
      spf: 'PASS',
      dkimAlignment: dkimEnabled ? 98 : 0,
      dmarcPolicy: dmarcEnabled ? 'quarantine' : 'none',
      tlsVersion,
    };
  }

  private parseEnvVars(envArray: string[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const e of envArray) {
      const [key, ...rest] = e.split('=');
      map[key] = rest.join('=');
    }
    return map;
  }
}
