import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Login } from './login/login';

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
