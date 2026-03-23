import { Controller, Get, UseGuards } from '@nestjs/common';
import { DnsService } from './dns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dns')
export class DnsController {
  constructor(private readonly service: DnsService) {}

  @Get('records')
  async getDnsRecords() {
    return { data: await this.service.getDnsRecords() };
  }

  @Get('auth-status')
  async getAuthStatus() {
    return { data: await this.service.getAuthStatus() };
  }
}
