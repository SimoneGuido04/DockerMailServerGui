import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DockerModule } from '../docker/docker.module';

@Module({
  imports: [DockerModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
