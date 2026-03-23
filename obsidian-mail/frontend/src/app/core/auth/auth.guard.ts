import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    authService.login();
    return false;
  }

  if (!authService.hasRequiredGroup()) {
    return router.createUrlTree(['/unauthorized']);
  }

  return true;
};
