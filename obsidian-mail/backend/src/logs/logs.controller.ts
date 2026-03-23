import { Controller, Get, Query, Sse, MessageEvent, UseGuards } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { LogsService } from './logs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('logs')
export class LogsController {
  constructor(private readonly service: LogsService) {}

  @Get('sources')
  async getSources() {
    return { data: await this.service.getSources() };
  }

  @Sse('stream')
  streamLogs(
    @Query('source') source: string,
    @Query('severity') severity: string,
  ): Observable<MessageEvent> {
    const severities = severity ? severity.split(',') : ['INFO', 'WARN', 'ERROR'];
    return this.service.streamLogs(source ?? 'mail.log', severities).pipe(
      map(entry => ({ data: entry }) as MessageEvent),
    );
  }

  @Get('search')
  async searchLogs(
    @Query('q') q: string,
    @Query('source') source: string,
  ) {
    return { data: await this.service.searchLogs(q ?? '', source ?? 'mail.log') };
  }

  @Get('stats')
  async getStats() {
    return { data: await this.service.getStats() };
  }
}
