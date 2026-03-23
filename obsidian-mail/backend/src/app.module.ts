import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DockerModule } from './docker/docker.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MailboxesModule } from './mailboxes/mailboxes.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DockerModule,
    DashboardModule,
    MailboxesModule,
    SettingsModule,
  ],
})
export class AppModule {}
