import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomeComponent } from './components/dashboard-home/dashboard-home.component';
import { IsLogged } from '../shared/services/is-logged.guard';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import {SharedModule} from "../shared/shared.module";
import {NotestSharedModule} from "../notest-shared/notest-shared.module";

const routes: Routes = [
  { path: 'home', component: DashboardHomeComponent, canActivate: [IsLogged] }
];

@NgModule({
  declarations: [DashboardHomeComponent, SidebarComponent],
  imports: [CommonModule, RouterModule.forChild(routes), SharedModule, NotestSharedModule]
})
export class DashboardModule {}
