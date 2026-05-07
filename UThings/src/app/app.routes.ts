import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Notas } from './notas/notas';
import { Home } from './home/home';
import { Error } from './error/error';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'notas', component: Notas },
  { path: 'home', component: Home },
  { path: 'editor/:id', component: Notas },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', component: Error }
];
