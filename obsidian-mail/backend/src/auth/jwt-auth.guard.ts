import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly reflector: Reflector,
  ) {
    super();
  }

  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
    if (err || !user) throw new UnauthorizedException();

    // Check Zitadel group/role claim
    const requiredGroup = this.config.get<string>('REQUIRED_GROUP', 'obsidian-mail-admins');
    const roles = user['urn:zitadel:iam:org:project:roles'] as Record<string, unknown> | undefined;

    const hasGroup =
      (roles && requiredGroup in roles) ||
      (Array.isArray(user['roles']) && (user['roles'] as string[]).includes(requiredGroup));

    if (!hasGroup) {
      throw new ForbiddenException(`Requires group: ${requiredGroup}`);
    }

    return user;
  }
}
