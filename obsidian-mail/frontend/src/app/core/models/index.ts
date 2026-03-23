// ── Server / Dashboard ──────────────────────────────────────────────────────

export interface ServiceStatus {
  name: string;
  subtitle: string;
  icon: string;
  status: 'running' | 'stopped' | 'active' | 'inactive';
}

export interface ServerStats {
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  version: string;
  queueSize: number;
  totalMailboxes: number;
  totalDomains: number;
  lastActivity: string;
  services: ServiceStatus[];
}

export interface QueueMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  size: number;
  timestamp: string;
  status: 'queued' | 'deferred' | 'bounced';
}

// ── Mailboxes ───────────────────────────────────────────────────────────────

export interface Mailbox {
  email: string;
  domain: string;
  quota?: string;
  isAdmin: boolean;
}

export interface CreateMailboxDto {
  email: string;
  password: string;
  quota?: string;
}

export interface Alias {
  alias: string;
  destination: string;
}

// ── Domains ─────────────────────────────────────────────────────────────────

export interface Domain {
  name: string;
  mailboxCount: number;
  aliasCount: number;
}

// ── Settings ────────────────────────────────────────────────────────────────

export interface ServerSetting {
  key: string;
  value: string;
  description?: string;
}

// ── DNS & Deliverability ─────────────────────────────────────────────────────

export interface DnsRecord {
  type: 'SPF' | 'DKIM' | 'DMARC';
  host: string;
  value: string;
  status: 'ok' | 'warning' | 'error';
}

export interface AuthStatus {
  spf: 'PASS' | 'FAIL' | 'SOFTFAIL' | 'NONE';
  dkimAlignment: number;
  dmarcPolicy: 'none' | 'quarantine' | 'reject';
  tlsVersion: string;
}

// ── Certificates ─────────────────────────────────────────────────────────────

export interface CertificateInfo {
  domain: string;
  issuer: string;
  expiry: string;
  daysRemaining: number;
  status: 'valid' | 'expiring' | 'expired' | 'renewing';
  autoRenew: boolean;
  type: 'letsencrypt' | 'custom';
}

export interface LetsEncryptStatus {
  enabled: boolean;
  autoRenewal: boolean;
  nextCheck: string;
  forceHttps: boolean;
}

export interface DaneStatus {
  configured: boolean;
  records: { domain: string; tlsaRecord: string; valid: boolean }[];
}

export interface CertSummary {
  expired: number;
  valid: number;
  expiringSoon: number;
}

// ── Security ─────────────────────────────────────────────────────────────────

export interface RspamdStats {
  totalScanned: number;
  spamCount: number;
  hamCount: number;
  spamRatio: number;
  avgScore: number;
  scoreDistribution: { range: string; count: number; color: string }[];
}

export interface ClamAvThreat {
  name: string;
  target: string;
  status: 'QUARANTINED' | 'DELETED' | 'DETECTED';
  timestamp: string;
}

export interface ClamAvStatus {
  version: string;
  dbUpdated: string;
  threats: ClamAvThreat[];
}

export interface Fail2BanBan {
  ip: string;
  jail: string;
  bannedAt: string;
  remaining: string;
  remainingPercent: number;
  country: string;
  countryCode: string;
}

export interface Fail2BanStatus {
  jails: string[];
  totalBans: number;
  bans: Fail2BanBan[];
}

export interface SecurityTelemetry {
  postscreenBlocked: number;
  tls13Usage: number;
  insecureAuths: number;
}

// ── Logs ─────────────────────────────────────────────────────────────────────

export interface LogSource {
  name: string;
  path: string;
  size: string;
}

export interface LogEntry {
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR';
  service: string;
  message: string;
}

export interface LogStats {
  storageUsed: string;
  storageTotal: string;
  storagePercent: number;
  ingestRate: string;
  syncStatus: 'LIVE' | 'DELAYED' | 'OFFLINE';
}

// ── Command Palette ───────────────────────────────────────────────────────────

export interface PaletteAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  iconColor?: string;
  shortcut?: string;
  route?: string;
}

// ── API response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
