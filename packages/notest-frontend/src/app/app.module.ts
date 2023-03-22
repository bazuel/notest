import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { DashboardModule } from './dashboard/dashboard.module';

const routes: Routes = [
  {
    path: 'session',
    loadChildren: () => import('./session/session.module').then((m) => m.SessionModule)
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule)
  },
  {
    path: '',
    redirectTo: 'dashboard/home',
    pathMatch: 'prefix'
  }

];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), SharedModule, DashboardModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
