import { Routes } from '@angular/router';

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
    path: 'admin',
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
