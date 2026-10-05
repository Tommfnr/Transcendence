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
import { EditAddPost } from './pages/editAddPost/editAddPost';
import { GroupParameter } from './pages/groupParameter/groupParameter';
import { EditAddGroup } from './pages/editAddGroup/editAddGroup';
import { ICanHelp } from './pages/iCanHelp/iCanHelp';
import { OfferHelp } from './pages/offerHelp/offerHelp';
import { AssistanceOfferDetails } from './pages/assistanceOfferDetails/assistanceOfferDetails';
import { ExampleGroupList } from './pages/exampleGroupList/exampleGroupList';
import { ChatPreview } from './pages/chatPreview/chatPreview';
import { authGuard } from './guards/auth.guard';

import { PrivacyPolicy } from './pages/privacyPolicy/privacyPolicy';
import { TermsOfService } from './pages/termsOfService/termsOfService';

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
		path: 'privacyPolicy',
		component: PrivacyPolicy
	  },
	  {
		path: 'termsOfService',
		component: TermsOfService,
	  }
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
        path: 'editAddObject/:id',
        component: EditAddObject
      },
      {
        path: 'editAddPost',
        component: EditAddPost
      },
      {
        path: 'editAddPost/:id',
        component: EditAddPost
      },
      {
        path: 'groupParameter',
        component: GroupParameter
      },
      {
        path: 'editAddGroup',
        component: EditAddGroup
      },
      {
        path: 'editAddGroup/:id',
        component: EditAddGroup
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
      },
      {
        path: 'chatPreview',
        component: ChatPreview
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
