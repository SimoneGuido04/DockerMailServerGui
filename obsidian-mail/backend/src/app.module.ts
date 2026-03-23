import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { DockerModule } from './docker/docker.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { MailboxesModule } from './mailboxes/mailboxes.module';
import { SettingsModule } from './settings/settings.module';
import { LogsModule } from './logs/logs.module';
import { CertificatesModule } from './certificates/certificates.module';
import { SecurityModule } from './security/security.module';
import { DnsModule } from './dns/dns.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    DockerModule,
    DashboardModule,
    MailboxesModule,
    SettingsModule,
    LogsModule,
    CertificatesModule,
    SecurityModule,
    DnsModule,
  ],
})
export class AppModule { }
