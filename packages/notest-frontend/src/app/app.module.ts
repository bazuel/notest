import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from './shared/shared.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { UserModule } from './user/user.module';

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
    path: 'user',
    loadChildren: () => import('./user/user.module').then((m) => m.UserModule)
  },
  {
    path: 'battery',
    loadChildren: () => import('./battery/battery.module').then((m) => m.BatteryModule)
  },
  {
    path: '',
    redirectTo: 'dashboard/home',
    pathMatch: 'prefix'
  }
];

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, RouterModule.forRoot(routes), SharedModule, DashboardModule, UserModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
