import { Injectable, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, isObservable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private roleCache = new Map<string, { roles: any; expires: number }>();

  constructor(private readonly config: ConfigService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const result = super.canActivate(context);
    const isAuthentic = isObservable(result) ? await firstValueFrom(result) : await result;
    
    if (!isAuthentic) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new UnauthorizedException();

    const requiredGroup = this.config.get<string>('REQUIRED_GROUP', 'obsidian-mail-admins');
    let roles = user['urn:zitadel:iam:org:project:roles'] as Record<string, unknown> | undefined;

    // Se i ruoli non sono presenti nel token minimale, li cerchiamo asincronamente dall'API di Zitadel (Introspection)
    if (!roles) {
      const accessToken = request.headers['x-zitadel-access-token'];
      if (accessToken) {
        const cached = this.roleCache.get(accessToken);
        if (cached && cached.expires > Date.now()) {
          roles = cached.roles;
        } else {
          const issuer = this.config.get<string>('ZITADEL_ISSUER');
          // Node 18+ ha fetch() nativo
          try {
            const res = await fetch(`${issuer}/oidc/v1/userinfo`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (res.ok) {
              const userInfo = await res.json();
              roles = userInfo['urn:zitadel:iam:org:project:roles'] || userInfo.info?.['urn:zitadel:iam:org:project:roles'];
              if (roles) {
                // Cache per 5 minuti per evitare rallentamenti nelle performance API
                this.roleCache.set(accessToken, { roles, expires: Date.now() + 5 * 60 * 1000 });
              }
            }
          } catch (err) {
            // Se fallisce (es. offline) lasciamo che la validazione in basso scatti e generi 403.
          }
        }
      }
    }

    const hasGroup =
      (roles && requiredGroup in roles) ||
      (Array.isArray(user['roles']) && (user['roles'] as string[]).includes(requiredGroup));

    if (!hasGroup) {
      throw new ForbiddenException(`Requires group: ${requiredGroup}`);
    }

    return true;
  }
}
