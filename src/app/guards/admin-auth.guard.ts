import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Só permite entrar no /admin com sessão ativa.
  if (auth.isAuthenticated()) {
    return true;
  }

  // Sem sessão, redireciona para login.
  return router.createUrlTree(['/admin/login']);
};
