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
import { Chats } from './pages/chats/chats';
import { authGuard } from './guards/auth.guard';

import { PrivacyPolicy } from './pages/privacyPolicy/privacyPolicy';
import { TermsOfService } from './pages/termsOfService/termsOfService';
import { UserAnalytics } from './pages/userAnalytics/userAnalytics';
import { HelpSupport } from './pages/helpSupport/help-support';
import { NotFound } from './pages/notFound/notFound';

export const routes: Routes = [
	{
		path: '',
		component: MarketingLayout,
		children: [
			{
				path: '',
				component: Landing,
				title: 'Welcome on PEP'
			},
			{
				path: 'login',
				component: Login,
				title: 'Login'
			},
			{
				path: 'register',
				component: Register,
				title: 'Register'
			},
			{
				path: 'privacyPolicy',
				component: PrivacyPolicy,
				title: 'Privacy Policy'
			},
			{
				path: 'termsOfService',
				component: TermsOfService,
				title: 'Terms of service'
			},
			{
				path: 'notFound',
				component: NotFound,
				title: '404 - Page not found'
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
				component: Dashboard,
				title: 'Dashboard'
			},
			{
				path: 'profile',
				component: Profile,
				title: 'Profile'
			},
			{
				path: 'catalog',
				component: Catalog,
				title: 'Your catalog'
			},
			{
				path: 'editAddObject',
				component: EditAddObject,
				title: 'Edit / add item'
			},
			{
				path: 'editAddObject/:id',
				component: EditAddObject,
				title: 'Edit / add item'
			},
			{
				path: 'editAddPost',
				component: EditAddPost,
				title: 'Edit / add post'
			},
			{
				path: 'editAddPost/:id',
				component: EditAddPost,
				title: 'Edit / add post'
			},
			{
				path: 'groupParameter',
				component: GroupParameter,
				title: 'Group parameters'
			},
			{
				path: 'editAddGroup',
				component: EditAddGroup,
				title: 'Edit / add group'
			},
			{
				path: 'editAddGroup/:id',
				component: EditAddGroup,
				title: 'Edit / add group'
			},
			{
				path: 'iCanHelp/:postId',
				component: ICanHelp,
				title: 'I can help'
			},
			{
				path: 'offerHelp/:postId',
				component: OfferHelp,
				title: 'I offer my help'
			},
			{
				path: 'chats',
				component: Chats,
				title: 'Chats'
			},
			{
				path: 'userAnalytics',
				component: UserAnalytics,
				title: 'User analytics'
			},
			{
				path: 'privacyPolicy',
				component: PrivacyPolicy,
				title: 'Privacy Policy'
			},
			{
				path: 'termsOfService',
				component: TermsOfService,
				title: 'Terms of service'
			},
			{
				path: 'helpSupport',
				component: HelpSupport,
				title: 'Help support'
			},
			{
				path: 'notFound',
				component: NotFound,
				title: '404 - Not found'
			}
		]
	},
	{
		path: '**',
		redirectTo: 'app/notFound',
		title: '404 - Not found'
	},
];
