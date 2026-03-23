import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DockerService } from '../docker/docker.service';

export class CreateMailboxDto {
  email: string;
  password: string;
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
      .map(line => {
        const parts = line.trim().split(/\s+/);
        const email = parts[0];
        const [, domain] = email.split('@');
        return {
          email,
          domain,
          quota: parts[1] ?? null,
          isAdmin: false,
        };
      });
  }

  private parseAliasList(stdout: string) {
    return stdout
      .split('\n')
      .filter(l => l.includes('->') || l.includes('|'))
      .map(line => {
        const [alias, destination] = line.includes('->') ? line.split('->') : line.split('|');
        return {
          alias: alias.trim(),
          destination: destination.trim(),
        };
      });
  }
}
