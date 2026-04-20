import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';

import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMailboxDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  quota?: string;
}

@Injectable()
export class MailboxesService {
  constructor(private readonly docker: DockerService) {}

  async list() {
    const result = await this.docker.runSetup(['email', 'list']);
    return this.parseMailboxList(result.stdout);
  }

  async create(dto: CreateMailboxDto): Promise<void> {
    const { email, password, quota } = dto;

    if (!email.includes('@')) throw new BadRequestException('Invalid email');

    const args = ['email', 'add', email, password];
    if (quota) args.push(quota);

    const result = await this.docker.runSetup(args);
    if (result.exitCode !== 0) {
      throw new BadRequestException(result.stderr || 'Failed to create mailbox');
    }
  }

  async delete(email: string): Promise<void> {
    const result = await this.docker.runSetup(['email', 'del', email]);
    if (result.exitCode !== 0) {
      throw new NotFoundException(result.stderr || `Mailbox ${email} not found`);
    }
  }

  async updatePassword(email: string, password: string): Promise<void> {
    const result = await this.docker.runSetup(['email', 'update', email, password]);
    if (result.exitCode !== 0) {
      throw new BadRequestException(result.stderr || 'Failed to update password');
    }
  }

  async listAliases() {
    const result = await this.docker.runSetup(['alias', 'list']);
    return this.parseAliasList(result.stdout);
  }

  async createAlias(alias: string, destination: string): Promise<void> {
    const result = await this.docker.runSetup(['alias', 'add', alias, destination]);
    if (result.exitCode !== 0) {
      throw new BadRequestException(result.stderr || 'Failed to create alias');
    }
  }

  async deleteAlias(alias: string): Promise<void> {
    const result = await this.docker.runSetup(['alias', 'del', alias]);
    if (result.exitCode !== 0) {
      throw new NotFoundException(result.stderr || `Alias ${alias} not found`);
    }
  }

  async listDomains() {
    const mailboxes = await this.list();
    const aliases = await this.listAliases();

    const domainMap = new Map<string, { mailboxCount: number; aliasCount: number }>();

    for (const mb of mailboxes) {
      const domain = mb.email.split('@')[1];
      if (!domainMap.has(domain)) domainMap.set(domain, { mailboxCount: 0, aliasCount: 0 });
      domainMap.get(domain)!.mailboxCount++;
    }

    for (const alias of aliases) {
      const domain = alias.alias.split('@')[1];
      if (!domainMap.has(domain)) domainMap.set(domain, { mailboxCount: 0, aliasCount: 0 });
      domainMap.get(domain)!.aliasCount++;
    }

    return Array.from(domainMap.entries()).map(([name, counts]) => ({ name, ...counts }));
  }

  // ── Parsers ──────────────────────────────────────────────────────────────

  private parseMailboxList(stdout: string) {
    return stdout
      .split('\n')
      .filter(l => l.includes('@'))
      // Exclude alias lines: they contain '->' or '|' separators, or the word 'aliases'
      .filter(l => !l.includes('->') && !l.includes('|'))
      .map(line => {
        // Find the actual email token (matches anything with an @ symbol)
        const parts = line.trim().split(/\s+/);
        const email = parts.find(p => p.includes('@')) || '';
        const [, domain] = email.split('@');

        // Quota is usually the token after "( " in the new format or just parts[1]
        let quota: string | null = null;
        if (line.includes('(') && line.includes('/')) {
           const match = line.match(/\(\s*([^\s]+)\s*\//);
           if (match) quota = match[1];
        } else if (parts.length > 1 && !parts.includes('*')) {
           quota = parts[1];
        }

        return {
          email,
          domain: domain || '',
          quota,
          isAdmin: false,
        };
      })
      .filter(mb => mb.email)
      // Final guard: exclude entries that look like aliases (quota is an email or 'aliases')
      .filter(mb => !mb.quota || (!mb.quota.includes('@') && mb.quota.toLowerCase() !== 'aliases'));
  }

  private parseAliasList(stdout: string) {
    return stdout
      .split('\n')
      .filter(l => l.includes('@'))
      .map(line => {
        // Normalise: strip leading '* ' then split by '->', '|', or whitespace
        const normalized = line.replace(/^\*\s*/, '').trim();

        if (normalized.includes('->')) {
          const [a, d] = normalized.split('->');
          return { alias: a.trim(), destination: d.trim() };
        }
        if (normalized.includes('|')) {
          const [a, d] = normalized.split('|');
          return { alias: a.trim(), destination: d.trim() };
        }
        // Space-separated format: "alias@domain dest@domain"
        const parts = normalized.split(/\s+/);
        if (parts.length >= 2 && parts[0].includes('@') && parts[1].includes('@')) {
          return { alias: parts[0], destination: parts[1] };
        }
        return null;
      })
      .filter((a): a is { alias: string; destination: string } => !!a && !!a.alias && !!a.destination);
  }
}
