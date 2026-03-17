import { RenderMode, ServerRoute } from '@angular/ssr';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ForgotComponent } from './auth/forgot-password/forgot-password';
import { ResetComponent } from './auth/reset-password/reset-password';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  { 
    path: 'forgot-password', 
    component: ForgotComponent 
  },
  { 
    path: 'reset/:token', 
    component: ResetComponent 
  },
];
