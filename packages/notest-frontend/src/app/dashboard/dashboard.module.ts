import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { IsLogged } from '../shared/services/is-logged.guard';

const routes: Routes = [
  { path: 'home', component: DashboardHomeComponent, canActivate: [IsLogged] }
];

@NgModule({
  declarations: [DashboardHomeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)]
})
export class DashboardModule {}
