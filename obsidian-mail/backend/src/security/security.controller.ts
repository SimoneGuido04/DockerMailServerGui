import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { SecurityService } from './security.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('security')
export class SecurityController {
  constructor(private readonly service: SecurityService) {}

  @Get('rspamd')
  async getRspamdStats() {
    return { data: await this.service.getRspamdStats() };
  }

  @Get('clamav')
  async getClamAvStatus() {
    return { data: await this.service.getClamAvStatus() };
  }

  @Get('fail2ban')
  async getFail2BanStatus() {
    return { data: await this.service.getFail2BanStatus() };
  }

  @Get('telemetry')
  async getSecurityTelemetry() {
    return { data: await this.service.getSecurityTelemetry() };
  }

  @Post('fail2ban/unban/:ip')
  async unbanIp(@Param('ip') ip: string, @Body('jail') jail: string) {
    await this.service.unbanIp(jail, ip);
    return { data: null, message: `Unbanned ${ip} from ${jail}` };
  }

  @Post('fail2ban/flush')
  async flushBans() {
    await this.service.flushBans();
    return { data: null, message: 'All bans flushed' };
  }
}
