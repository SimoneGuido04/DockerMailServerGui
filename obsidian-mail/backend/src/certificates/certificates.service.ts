import { Injectable, BadRequestException } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';

export interface CertificateInfo {
  domain: string;
  issuer: string;
  expiry: string;
  daysRemaining: number;
  status: 'valid' | 'expiring' | 'expired' | 'renewing';
  autoRenew: boolean;
  type: 'letsencrypt' | 'custom';
}

@Injectable()
export class CertificatesService {
  constructor(private readonly docker: DockerService) {}

  async getCertificate(): Promise<CertificateInfo> {
    const certs = await this.getCertificateList();
    return certs[0] ?? this.fallbackCert();
  }

  async getCertificateList(): Promise<CertificateInfo[]> {
    // List LE live directories
    const ls = await this.docker.exec([
      'sh', '-c', 'ls /etc/letsencrypt/live/ 2>/dev/null',
    ]);

    const domains = ls.stdout.split('\n').map(l => l.trim()).filter(Boolean).filter(l => l !== 'README');

    if (domains.length === 0) {
      // Try custom certs
      const customLs = await this.docker.exec([
        'sh', '-c', 'ls /tmp/docker-mailserver/ssl/*.pem 2>/dev/null',
      ]);
      if (customLs.stdout.trim()) {
        return [await this.inspectCustomCert(customLs.stdout.trim().split('\n')[0])];
      }
      return [];
    }

    const results: CertificateInfo[] = [];
    for (const domain of domains) {
      const certPath = `/etc/letsencrypt/live/${domain}/cert.pem`;
      results.push(await this.inspectCert(domain, certPath, true));
    }
    return results;
  }

  async getLetsEncryptStatus(): Promise<{
    enabled: boolean;
    autoRenewal: boolean;
    nextCheck: string;
    forceHttps: boolean;
  }> {
    const info = await this.docker.getContainerInfo();
    const envVars = this.parseEnvVars(info?.Config?.Env ?? []);

    const enabled = !!(envVars['SSL_TYPE'] === 'letsencrypt' || envVars['LETSENCRYPT_EMAIL']);
    const forceHttps = envVars['ENABLE_FAIL2BAN'] !== '0';

    const nextCheck = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    return { enabled, autoRenewal: enabled, nextCheck, forceHttps };
  }

  async getCertSummary(): Promise<{ expired: number; valid: number; expiringSoon: number }> {
    const certs = await this.getCertificateList();
    const expired = certs.filter(c => c.status === 'expired').length;
    const expiringSoon = certs.filter(c => c.status === 'expiring').length;
    const valid = certs.filter(c => c.status === 'valid').length;
    return { expired, valid, expiringSoon };
  }

  async getDaneStatus(): Promise<{
    configured: boolean;
    records: { domain: string; tlsaRecord: string; valid: boolean }[];
  }> {
    const certs = await this.getCertificateList();
    const records: { domain: string; tlsaRecord: string; valid: boolean }[] = [];

    for (const cert of certs) {
      const certPath = `/etc/letsencrypt/live/${cert.domain}/cert.pem`;
      const tlsa = await this.docker.exec([
        'sh', '-c',
        `openssl x509 -in "${certPath}" -outform DER 2>/dev/null | openssl dgst -sha256 -binary 2>/dev/null | xxd -p 2>/dev/null | tr -d '\\n'`,
      ]);

      if (tlsa.stdout.trim()) {
        records.push({
          domain: `_25._tcp.${cert.domain}`,
          tlsaRecord: `3 1 1 ${tlsa.stdout.trim()}`,
          valid: cert.status === 'valid',
        });
      }
    }

    return { configured: records.length > 0, records };
  }

  async requestCertificate(domain?: string): Promise<void> {
    const args = domain
      ? ['certbot', 'certonly', '--standalone', '-d', domain, '--non-interactive', '--agree-tos']
      : ['setup', 'config', 'ssl', 'letsencrypt'];

    const result = await this.docker.exec(args);
    if (result.exitCode !== 0) {
      throw new BadRequestException(result.stderr || 'Certificate request failed');
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async inspectCert(domain: string, certPath: string, isLE: boolean): Promise<CertificateInfo> {
    const result = await this.docker.exec([
      'sh', '-c', `openssl x509 -in "${certPath}" -noout -subject -issuer -enddate 2>/dev/null`,
    ]);

    return this.parseCertOutput(result.stdout, domain, isLE);
  }

  private async inspectCustomCert(certPath: string): Promise<CertificateInfo> {
    const result = await this.docker.exec([
      'sh', '-c', `openssl x509 -in "${certPath}" -noout -subject -issuer -enddate 2>/dev/null`,
    ]);
    const domain = certPath.split('/').pop()?.replace('-full.pem', '') ?? 'unknown';
    return this.parseCertOutput(result.stdout, domain, false);
  }

  private parseCertOutput(output: string, domain: string, isLE: boolean): CertificateInfo {
    const issuerMatch = output.match(/issuer=.*?O\s*=\s*([^,\n]+)/);
    const expiryMatch = output.match(/notAfter=(.*)/);

    const issuer = issuerMatch?.[1]?.trim() ?? (isLE ? "Let's Encrypt" : 'Unknown CA');
    const expiryStr = expiryMatch?.[1]?.trim() ?? '';
    const expiry = expiryStr ? new Date(expiryStr).toISOString() : '';
    const daysRemaining = expiry
      ? Math.floor((new Date(expiry).getTime() - Date.now()) / 86400000)
      : -1;

    let status: CertificateInfo['status'] = 'valid';
    if (daysRemaining < 0) status = 'expired';
    else if (daysRemaining < 30) status = 'expiring';

    return { domain, issuer, expiry, daysRemaining, status, autoRenew: isLE, type: isLE ? 'letsencrypt' : 'custom' };
  }

  private parseEnvVars(envArray: string[]): Record<string, string> {
    const map: Record<string, string> = {};
    for (const e of envArray) {
      const [key, ...rest] = e.split('=');
      map[key] = rest.join('=');
    }
    return map;
  }

  private fallbackCert(): CertificateInfo {
    return {
      domain: 'Not configured',
      issuer: '—',
      expiry: '',
      daysRemaining: -1,
      status: 'expired',
      autoRenew: false,
      type: 'custom',
    };
  }
}
