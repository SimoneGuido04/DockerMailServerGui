import { Module } from '@nestjs/common';
import { MailboxesController } from './mailboxes.controller';
import { MailboxesService } from './mailboxes.service';
import { DockerModule } from '../docker/docker.module';

@Module({
  imports: [DockerModule],
  controllers: [MailboxesController],
  providers: [MailboxesService],
})
export class MailboxesModule {}
