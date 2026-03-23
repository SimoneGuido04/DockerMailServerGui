import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('stats')
  async getStats() {
    return { data: await this.service.getStats() };
  }

  @Get('queue')
  async getQueue() {
    return { data: await this.service.getQueue() };
  }

  @Get('throughput')
  async getThroughput() {
    return { data: await this.service.getThroughput() };
  }
}
