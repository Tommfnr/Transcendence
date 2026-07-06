import { Routes } from '@angular/router';
import { MarketingLayout } from './layouts/marketing-layout/marketing-layout';
import { Home } from './pages/home/home';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

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
    path: 'home',
    component: Home
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
