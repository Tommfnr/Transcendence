import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'login',
    component: Login
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
