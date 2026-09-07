import { Routes } from '@angular/router';
import { MarketingLayout } from './layouts/marketing-layout/marketing-layout';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { AppLayout } from './layouts/app-layout/app-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Profile } from './pages/profile/profile';
import { Catalog } from './pages/catalog/catalog';
import { EditAddObject } from './pages/editAddObject/editAddObject';
import { GroupParameter } from './pages/groupParameter/groupParameter';
import { ICanHelp } from './pages/iCanHelp/iCanHelp';
import { OfferHelp } from './pages/offerHelp/offerHelp';
import { AssistanceOfferDetails } from './pages/assistanceOfferDetails/assistanceOfferDetails';
import { ExampleGroupList } from './pages/exampleGroupList/exampleGroupList';
import { authGuard } from './guards/auth.guard';

import { Test } from './pages/test/test';

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
	  {
		path: 'test',
		component: Test
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
      },
      {
        path: 'editAddObject',
        component: EditAddObject
      },
      {
        path: 'groupParameter',
        component: GroupParameter
      },
      {
        path: 'iCanHelp',
        component: ICanHelp
      },
      {
        path: 'offerHelp',
        component: OfferHelp
      },
      {
        path: 'assistanceOfferDetails',
        component: AssistanceOfferDetails
      },
      {
        path: 'exampleGroupList',
        component: ExampleGroupList
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
