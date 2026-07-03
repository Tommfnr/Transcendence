import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Home2 } from './pages/home2/home2';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

export const routes: Routes = [
  {
    path: 'home',
    component: Home
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
	path: '',
	component: Home2
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
