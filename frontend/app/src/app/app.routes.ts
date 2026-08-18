import { Routes } from '@angular/router';
import { MarketingLayout } from './layouts/marketing-layout/marketing-layout';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AppLayout } from './layouts/app-layout/app-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Profile } from './pages/profile/profile';
import { Catalog } from './pages/catalog/catalog';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: MarketingLayout,
    children: [
      {
        path: '',
        component: Landing
      },
      {
        path: 'login',
        component: Login
      },
      {
        path: 'register',
        component: Register
      },
    ],
  },
  {
    path: 'app',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: Dashboard
      },
      {
        path: 'profile',
        component: Profile
      },
      {
        path: 'catalog',
        component: Catalog
      }
    ]
  },

  //   {
  //     path: 'items',
  //     component: ItemListPageComponent
  //   },
  //   {
  //     path: 'items/:id',
  //     component: ItemDetailPageComponent
  //   },
  //   {
  //     path: 'profile',
  //     component: ProfilePageComponent
  //   },
];
