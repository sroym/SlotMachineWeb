import { Routes } from '@angular/router';
import { Login } from './login/login';
import { SlotMachine } from '../slot-machine/slot-machine';

export const routes: Routes = [
  {path:'login', component: Login},
  {path:'slot', component: SlotMachine},
  {path: '',redirectTo: '/login', pathMatch: 'full'},
];
