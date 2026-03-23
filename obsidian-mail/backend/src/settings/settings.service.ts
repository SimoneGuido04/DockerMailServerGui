import { Injectable } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';
import * as fs from 'fs/promises';
import * as path from 'path';

const ENV_FILE = process.env.MAILSERVER_ENV_FILE ?? '/tmp/mailserver.env';

const KNOWN_SETTINGS: Record<string, string> = {
  POSTFIX_INET_PROTOCOLS: 'all',
  SMTP_ONLY: '0',
  ENABLE_SMTP_AUTH: '1',
  ENABLE_FAIL2BAN: '0',
  SPOOF_PROTECTION: '0',
  ENABLE_SRS: '0',
  ENABLE_RSPAMD: '0',
  ENABLE_RSPAMD_REDIS: '0',
  RSPAMD_GREYLISTING: '0',
  SSL_TYPE: 'letsencrypt',
  TLS_LEVEL: 'modern',
  ENABLE_OPENDKIM: '1',
  ENABLE_OPENDMARC: '1',
  ENABLE_POLICYD_SPF: '1',
  ENABLE_QUOTAS: '1',
  POSTFIX_MAILBOX_SIZE_LIMIT: '0',
};

@Injectable()
export class SettingsService {
  constructor(private readonly docker: DockerService) {}

  async list() {
    const info = await this.docker.getContainerInfo();
    const envVars: Record<string, string> = { ...KNOWN_SETTINGS };

    if (info?.Config?.Env) {
      for (const e of info.Config.Env) {
        const [key, ...rest] = e.split('=');
        if (key in KNOWN_SETTINGS) {
          envVars[key] = rest.join('=');
        }
      }
    }

    try {
      const content = await fs.readFile(ENV_FILE, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        if (!line.trim() || line.startsWith('#')) continue;
        const [key, ...rest] = line.split('=');
        if (key && key.trim() in KNOWN_SETTINGS) {
          envVars[key.trim()] = rest.join('=').trim();
        }
      }
    } catch {
      // Ignora se il file non esiste ancora
    }

    return Object.keys(KNOWN_SETTINGS).map(key => ({
      key,
      value: envVars[key] ?? KNOWN_SETTINGS[key],
    }));
  }

  async update(key: string, value: string): Promise<void> {
    // Write to env file that docker-compose will use on next restart
    try {
      let content = '';
      try {
        content = await fs.readFile(ENV_FILE, 'utf8');
      } catch {
        // file doesn't exist yet
      }

      const lines = content.split('\n').filter(l => !l.startsWith(`${key}=`) && l.trim() !== '');
      lines.push(`${key}=${value}`);

      await fs.writeFile(ENV_FILE, lines.join('\n') + '\n', 'utf8');
    } catch (err) {
      throw new Error(`Failed to write setting: ${(err as Error).message}`);
    }
  }
}
