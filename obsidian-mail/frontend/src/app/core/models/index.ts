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

// ── API response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
}
