import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Landing } from './pages/landing/landing';
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
	component: Landing
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
