import { Routes } from '@angular/router';
import { adminAuthGuard } from './guards/admin-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'consulta',
    loadComponent: () =>
      import('./consulta/consulta.component').then((m) => m.ConsultaComponent),
  },
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./admin/login/admin-login.component').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    canActivate: [adminAuthGuard],
    loadComponent: () =>
      import('./admin/admin.component').then((m) => m.AdminComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./admin/participantes/participantes.component').then(
            (m) => m.ParticipantesComponent
          ),
      },
      {
        path: 'sorteio',
        loadComponent: () =>
          import('./admin/sorteio/sorteio.component').then(
            (m) => m.SorteioComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
