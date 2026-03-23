import { Controller, Get, Put, Param, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @Get()
  async list() {
    return { data: await this.service.list() };
  }

  @Put(':key')
  async update(@Param('key') key: string, @Body('value') value: string) {
    await this.service.update(key, value);
    return { message: 'Setting updated' };
  }
}
