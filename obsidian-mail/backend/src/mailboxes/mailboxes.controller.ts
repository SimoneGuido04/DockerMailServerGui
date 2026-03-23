import { Controller, Get, Post, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { MailboxesService, CreateMailboxDto } from './mailboxes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class MailboxesController {
  constructor(private readonly service: MailboxesService) {}

  // ── Mailboxes ────────────────────────────────────────────────────────────

  @Get('mailboxes')
  async list() {
    return { data: await this.service.list() };
  }

  @Post('mailboxes')
  async create(@Body() dto: CreateMailboxDto) {
    await this.service.create(dto);
    return { message: 'Mailbox created' };
  }

  @Delete('mailboxes/:email')
  async delete(@Param('email') email: string) {
    await this.service.delete(decodeURIComponent(email));
    return { message: 'Mailbox deleted' };
  }

  @Patch('mailboxes/:email/password')
  async updatePassword(@Param('email') email: string, @Body('password') password: string) {
    await this.service.updatePassword(decodeURIComponent(email), password);
    return { message: 'Password updated' };
  }

  // ── Aliases ──────────────────────────────────────────────────────────────

  @Get('aliases')
  async listAliases() {
    return { data: await this.service.listAliases() };
  }

  @Post('aliases')
  async createAlias(@Body('alias') alias: string, @Body('destination') destination: string) {
    await this.service.createAlias(alias, destination);
    return { message: 'Alias created' };
  }

  @Delete('aliases/:alias')
  async deleteAlias(@Param('alias') alias: string) {
    await this.service.deleteAlias(decodeURIComponent(alias));
    return { message: 'Alias deleted' };
  }

  // ── Domains ──────────────────────────────────────────────────────────────

  @Get('domains')
  async listDomains() {
    return { data: await this.service.listDomains() };
  }
}
