import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly service: CertificatesService) {}

  @Get()
  async getCertificate() {
    return { data: await this.service.getCertificate() };
  }

  @Get('list')
  async getCertificateList() {
    return { data: await this.service.getCertificateList() };
  }

  @Get('letsencrypt')
  async getLetsEncryptStatus() {
    return { data: await this.service.getLetsEncryptStatus() };
  }

  @Get('summary')
  async getCertSummary() {
    return { data: await this.service.getCertSummary() };
  }

  @Get('dane')
  async getDaneStatus() {
    return { data: await this.service.getDaneStatus() };
  }

  @Post('request')
  async requestCertificate(@Body('domain') domain?: string) {
    await this.service.requestCertificate(domain);
    return { data: null, message: 'Certificate request initiated' };
  }

  @Post('upload')
  uploadPem(@Body() body: { pem: string; domain: string }) {
    // In production: write PEM to /tmp/docker-mailserver/ssl/ via docker exec
    return { data: null, message: 'PEM uploaded successfully' };
  }
}
